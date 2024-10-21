"use client"

import HomeHeader from "@/components/layout/HomeHeader"
import { FixRequest_StatusData } from "@/lib/domain/Request/RequestStatus.mapper"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { App, Button, Card, Col, Row, Typography } from "antd"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import CountUp from "react-countup"
import HeadMaintenanceNavigaionDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"
import head_maintenance_queries from "@/features/head-maintenance/queries"

function Page() {
   const router = useRouter()
   const { notification } = App.useApp()
   const navDrawer = HeadMaintenanceNavigaionDrawer.useDrawer()
   const api_counts = head_maintenance_queries.dashboard.count({})

   const [tab, setTab] = useState("tasks")

   const total = useMemo(() => {
      const data = api_counts.data
      if (!data)
         return {
            task: 0,
            request: 0,
         }
      const values = Object.entries(data)

      const returnValue = values.reduce(
         (prev, [key, val]) => {
            if (key.toLowerCase().includes("request")) {
               return {
                  ...prev,
                  request: prev.request + val,
               }
            }
            if (key.toLowerCase().includes("task")) {
               return {
                  ...prev,
                  task: prev.task + val,
               }
            }
            return prev
         },
         {
            task: 0,
            request: 0,
         } as {
            task: number
            request: number
         },
      )
      return returnValue
   }, [api_counts.data])

   useEffect(() => {
      if (!api_counts.isSuccess) return

      if (api_counts.data.headStaffConfirmTasks > 0) {
         notification.destroy("headStaffConfirmTasks")
         notification.info({
            message: "Thông báo",
            description: `Có ${api_counts.data.headStaffConfirmTasks} tác vụ cần được kiểm tra`,
            btn: (
               <Button
                  onClick={() => {
                     router.push(`/head-staff/mobile/tasks?status=${TaskStatus.HEAD_STAFF_CONFIRM}`)
                  }}
                  type="primary"
                  size="large"
               >
                  Xem chi tiết
               </Button>
            ),
            key: "headStaffConfirmTasks",
         })
      }

      return () => {
         notification.destroy("headStaffConfirmTasks")
      }
   }, [api_counts.data, api_counts.isSuccess, notification, router])

   return (
      <div>
         <div>
            <Image
               className="std-layout-outer absolute h-32 w-full object-cover opacity-40"
               src="/images/background5.jpg"
               alt="image"
               width={784}
               height={100}
               style={{
                  WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
                  maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
                  objectFit: "fill",
               }}
            />
            <div className="std-layout">
               <HomeHeader className="std-layout-inner pb-8 pt-4" onIconClick={navDrawer.handleOpen} />
            </div>
         </div>
         <div className="std-layout">
            <section className="mt-5 grid grid-cols-2 gap-4">
               <Card
                  loading={api_counts.isPending}
                  onClick={() => setTab("tasks")}
                  className={cn(tab === "tasks" && "border-2 border-primary-400")}
                  hoverable
               >
                  <div className="bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        {/* <CheckSquareOffset className="mb-1" size={36} /> */}
                        <Row className="text-xl font-normal">Tổng cộng</Row>
                        <Row className="mt-2">
                           <CountUp className="flex align-bottom text-3xl font-bold" end={total.task} separator={","} />
                           <Typography.Text className="m-2 flex items-end text-base">tác vụ</Typography.Text>
                        </Row>
                     </Col>
                  </div>
               </Card>
               <Card
                  loading={api_counts.isPending}
                  onClick={() => setTab("requests")}
                  className={cn(tab === "requests" && "border-2 border-primary-400")}
                  hoverable
               >
                  <div className="bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        {/* <Note className="mb-1" size={36} weight="duotone" /> */}
                        <Row className="text-xl font-normal">Tổng cộng</Row>
                        <Row className="mt-2">
                           <CountUp className="text-3xl font-bold" end={total.request} separator={","} />
                           <Typography.Text className="m-2 flex items-end text-base"> yêu cầu</Typography.Text>
                        </Row>
                     </Col>
                  </div>
               </Card>
            </section>
            <section className="mt-5 space-y-4">
               {tab === "tasks" && (
                  <div className="space-y-3 rounded-md bg-white p-3">
                     {[
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.awaitingSparePartTasks,
                           label: TaskStatusTagMapper[TaskStatus.AWAITING_SPARE_SPART].text,
                           // icon: <CalendarSlash size={36} weight="duotone" className="text-red-500" />,
                           route: "tasks",
                           bgColor: "bg-sky-100",
                           color: "text-yellow-500",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.awaitingFixerTasks,
                           label: TaskStatusTagMapper[TaskStatus.AWAITING_FIXER].text,
                           // icon: <CalendarSlash size={36} weight="duotone" className="text-red-500" />,
                           route: "tasks",
                           bgColor: "bg-neutral-50",
                           color: "text-red-500",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.assignedTasks,
                           label: TaskStatusTagMapper[TaskStatus.ASSIGNED].text,
                           // icon: <CalendarCheck size={36} weight="duotone" className="text-blue-500" />,
                           route: "tasks",
                           bgColor: "bg-sky-100",
                           color: "text-blue-500",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.inProgressTasks,
                           label: TaskStatusTagMapper[TaskStatus.IN_PROGRESS].text,
                           // icon: <HourglassSimpleMedium size={36} className="text-orange-500" weight="duotone" />,
                           route: "tasks",
                           bgColor: "bg-neutral-50",
                           color: "text-orange-500",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.headStaffConfirmTasks,
                           label: TaskStatusTagMapper[TaskStatus.HEAD_STAFF_CONFIRM].text,
                           // icon: <NotePencil size={36} weight="duotone" className="text-purple-500" />,
                           route: "tasks",
                           bgColor: "bg-sky-100",
                           color: "text-purple-500",
                        },
                     ].map(({ loading, count, label, route, bgColor, color }, index) => (
                        <Card
                           key={index}
                           className={`flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-neutral-200 p-0 text-center shadow-sm ${bgColor}`}
                           loading={loading}
                           onClick={() => router.push(route)}
                           classNames={{ body: "w-full px-4" }}
                        >
                           <div className="flex w-full items-start justify-between">
                              <div className="flex flex-col items-start">
                                 <div className="mb-2 text-lg">{label}</div>
                                 <div className="flex items-center"></div>
                              </div>
                              <div className={`text-2xl font-bold ${color} `}>
                                 <CountUp end={count ?? 0} separator="," />
                                 {/* <span className="ml-2 text-xs font-normal text-neutral-500">Tác vụ</span> */}
                              </div>
                              {/* <div className="flex items-center">{icon}</div> */}
                           </div>
                        </Card>
                     ))}
                  </div>
               )}

               {tab === "requests" && (
                  <div className="space-y-3 rounded-md bg-white p-3">
                     {[
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.pendingRequests,
                           label: FixRequest_StatusData("pending").text,
                           // icon: FixRequest_StatusData("pending", {
                           //    phosphor: { size: 36, weight: "duotone", className: "text-neutral-500" },
                           // }).icon,
                           route: "requests?status=PENDING",
                           bgColor: "bg-sky-100",
                           color: "text-neutral-500",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.approvedRequests,
                           label: FixRequest_StatusData("approved").text,
                           // icon: FixRequest_StatusData("approved", {
                           //    phosphor: { size: 36, weight: "duotone", className: "text-green-500" },
                           // }).icon,
                           route: "requests?status=APPROVED",
                           bgColor: "bg-neutral-50",
                           color: "text-green-500",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.inProgressRequests,
                           label: FixRequest_StatusData("in_progress").text,
                           // icon: FixRequest_StatusData("in_progress", {
                           //    phosphor: { size: 36, weight: "duotone", className: "text-blue-500" },
                           // }).icon,
                           route: "requests?status=IN_PROGRESS",
                           bgColor: "bg-sky-100",
                           color: "text-blue-500",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.rejectedRequests,
                           label: FixRequest_StatusData("rejected").text,
                           // icon: FixRequest_StatusData("rejected", {
                           //    phosphor: { size: 36, weight: "duotone", className: "text-red-500" },
                           // }).icon,
                           route: "requests?status=REJECTED",
                           bgColor: "bg-neutral-50",
                           color: "text-red-500",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.headConfirmRequests,
                           label: FixRequest_StatusData("head_confirm").text,
                           // icon: FixRequest_StatusData("head_confirm", {
                           //    phosphor: { size: 36, weight: "duotone", className: "text-purple-500" },
                           // }).icon,
                           route: "requests?status=HEAD_CONFIRM",
                           bgColor: "bg-sky-100",
                           color: "text-purple-500",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.closedRequests,
                           label: FixRequest_StatusData("closed").text,
                           // icon: FixRequest_StatusData("closed", {
                           //    phosphor: { size: 36, weight: "duotone", className: "text-green-500" },
                           // }).icon,
                           route: "requests?status=CLOSED",
                           bgColor: "bg-neutral-50",
                           color: "text-green-500",
                        },
                     ].map(({ loading, count, label, route, bgColor, color }, index) => (
                        <Card
                           key={index}
                           className={cn(
                              "flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-neutral-200 p-0 text-center shadow-sm",
                              bgColor,
                           )}
                           loading={loading}
                           onClick={() => router.push(route)}
                           classNames={{ body: "w-full px-4" }}
                        >
                           <div className="flex w-full items-start justify-between">
                              <div className="flex flex-col items-start">
                                 <div className="mb-2 text-lg">{label}</div>
                                 <div className="flex items-center"></div>
                              </div>
                              <div className={`text-2xl font-bold ${color} `}>
                                 <CountUp end={count ?? 0} separator="," />
                                 {/* <span className="ml-2 text-xs font-normal text-neutral-500">Yêu cầu</span> */}
                              </div>
                           </div>
                           {/* </div> */}
                           {/* <div className="flex items-center">{icon}</div> */}
                           {/* </div> */}
                        </Card>
                     ))}
                  </div>
               )}
            </section>
         </div>
      </div>
   )
}

export default Page
