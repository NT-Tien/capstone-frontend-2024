"use client"

import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_All30Days from "@/app/head-staff/_api/request/all30Days.api"
import HeadStaff_Task_All from "@/app/head-staff/_api/task/all.api"
import HomeHeader from "@/common/components/HomeHeader"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import { useQuery } from "@tanstack/react-query"
import { App, Card, Col, Collapse, Row, Spin, Typography } from "antd"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import CountUp from "react-countup"
import { useRouter } from "next/navigation"
import {
   CalendarCheck,
   CalendarSlash,
   CheckSquareOffset,
   Note,
   NotePencil,
   SealCheck,
   HourglassSimpleMedium,
} from "@phosphor-icons/react"
import Image from "next/image"
import HeadStaff_Dashboard_Count from "@/app/head-staff/_api/dashboard/count.api"
import { FixRequest_StatusData } from "@/common/dto/status/FixRequest.status"
import { cn } from "@/common/util/cn.util"

function useTask(current: number, pageSize: number, status: TaskStatus) {
   return useQuery({
      queryKey: headstaff_qk.task.all({
         page: current.toString(),
         limit: pageSize.toString(),
         status,
      }),
      queryFn: () =>
         HeadStaff_Task_All({
            page: current,
            limit: pageSize,
            status,
         }),
   })
}

function useRequest(current: number, pageSize: number, currentStatus: FixRequestStatus) {
   return useQuery({
      queryKey: headstaff_qk.request.all({
         page: current,
         limit: pageSize,
         status: currentStatus,
      }),
      queryFn: () =>
         HeadStaff_Request_All30Days({
            page: current,
            limit: pageSize,
            status: currentStatus as any,
         }),
   })
}

function Page() {
   return (
      <Suspense fallback={<Spin fullscreen />}>
         <DashboardPage />
      </Suspense>
   )
}

export default dynamic(() => Promise.resolve(Page), {
   ssr: false,
})

function DashboardPage() {
   const router = useRouter()
   const { modal } = App.useApp()

   const api_counts = useQuery({
      queryKey: headstaff_qk.dashboard.count(),
      queryFn: HeadStaff_Dashboard_Count,
   })

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
            if (key.includes("request")) {
               return {
                  ...prev,
                  request: prev.request + val,
               }
            }
            if (key.includes("task")) {
               return {
                  ...prev,
                  request: prev.task + val,
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
         modal.info({
            title: "Lưu ý",
            content: `Có ${api_counts.data.headStaffConfirmTasks} tác vụ cần được kiểm tra`,
            okText: "Xem",
            onOk: () => {
               router.push(`/head-staff/mobile/tasks?status=${TaskStatus.HEAD_STAFF_CONFIRM}`)
            },
            cancelText: "Đóng",
         })
      }
   }, [])

   const { Panel } = Collapse

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
               <HomeHeader className="std-layout-inner pb-8 pt-4" />
            </div>
         </div>
         <div className="std-layout">
            <section className="mt-5 grid grid-cols-2 gap-4">
               <Card loading={api_counts.isPending} onClick={() => router.push("tasks")} className="">
                  <div className="bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <CheckSquareOffset className="mb-1" size={36} />
                        <Row className="text-xl font-normal">Tổng cộng</Row>
                        <Row className="mt-2">
                           <CountUp className="flex align-bottom text-3xl font-bold" end={total.task} separator={","} />
                           <Typography.Text className="m-2 flex items-end text-base">tác vụ</Typography.Text>
                        </Row>
                     </Col>
                  </div>
               </Card>
               <Card loading={api_counts.isPending} onClick={() => router.push("requests")} className="">
                  <div className="bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Note className="mb-1" size={36} weight="duotone" />
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
               <Collapse accordion className="bg-white" defaultActiveKey="1">
                  <Panel header="Tác vụ" key="1" className="flex-none text-xl font-medium">
                     {[
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.pendingSparePartTasks,
                           label: TaskStatusTagMapper[TaskStatus.AWAITING_SPARE_SPART].text,
                           icon: <CalendarSlash size={36} weight="duotone" className="text-red-500" />,
                           route: "tasks",
                           bgColor: "bg-red-200",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.awaitingFixerTasks,
                           label: TaskStatusTagMapper[TaskStatus.AWAITING_FIXER].text,
                           icon: <CalendarSlash size={36} weight="duotone" className="text-red-500" />,
                           route: "tasks",
                           bgColor: "bg-red-200",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.assignedTasks,
                           label: TaskStatusTagMapper[TaskStatus.ASSIGNED].text,
                           icon: <CalendarCheck size={36} weight="duotone" className="text-blue-500" />,
                           route: "tasks",
                           bgColor: "bg-blue-200",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.inProgressTasks,
                           label: TaskStatusTagMapper[TaskStatus.IN_PROGRESS].text,
                           icon: <HourglassSimpleMedium size={36} className="text-orange-500" weight="duotone" />,
                           route: "tasks",
                           bgColor: "bg-orange-200",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.headStaffConfirmTasks,
                           label: TaskStatusTagMapper[TaskStatus.HEAD_STAFF_CONFIRM].text,
                           icon: <NotePencil size={36} weight="duotone" className="text-purple-500" />,
                           route: "tasks",
                           bgColor: "bg-purple-200",
                        },
                     ].map(({ loading, count, label, icon, route, bgColor }, index) => (
                        <Card
                           key={index}
                           className={`mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-neutral-200 p-0 text-center shadow-sm ${bgColor}`}
                           loading={loading}
                           onClick={() => router.push(route)}
                           classNames={{ body: "w-full px-4" }}
                        >
                           <div className="flex w-full items-start justify-between">
                              <div className="flex flex-col items-start">
                                 <div className="mb-2 text-lg">{label}</div>
                                 <div className="flex items-center">
                                    <div className="text-2xl font-bold">
                                       <CountUp end={count ?? 0} separator="," />
                                       <span className="ml-2 text-xs font-normal text-neutral-500">Tác vụ</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center">{icon}</div>
                           </div>
                        </Card>
                     ))}
                  </Panel>
               </Collapse>

               <Collapse accordion className="bg-white" defaultActiveKey="1">
                  <Panel header="Yêu cầu" key="1" className="flex-none text-xl font-medium">
                     {[
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.pendingRequests,
                           label: FixRequest_StatusData("pending").text,
                           icon: FixRequest_StatusData("pending", {
                              phosphor: { size: 36, weight: "duotone", className: "text-neutral-500" },
                           }).icon,
                           route: "requests?status=PENDING",
                           bgColor: "bg-neutral-200",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.approvedRequests,
                           label: FixRequest_StatusData("approved").text,
                           icon: FixRequest_StatusData("approved", {
                              phosphor: { size: 36, weight: "duotone", className: "text-green-500" },
                           }).icon,
                           route: "requests?status=APPROVED",
                           bgColor: "bg-green-200",
                        },
                        {
                           loading: api_counts.isPending,
                           count: api_counts.data?.inProgressRequests,
                           label: FixRequest_StatusData("in_progress").text,
                           icon: FixRequest_StatusData("in_progress", {
                              phosphor: { size: 36, weight: "duotone", className: "text-blue-500" },
                           }).icon,
                           route: "requests?status=IN_PROGRESS",
                           bgColor: "bg-blue-200",
                        },
                     ].map(({ loading, count, label, icon, route, bgColor }, index) => (
                        <Card
                           key={index}
                           className={cn(
                              "mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-neutral-200 p-0 text-center shadow-sm",
                              bgColor,
                           )}
                           loading={loading}
                           onClick={() => router.push(route)}
                           classNames={{ body: "w-full px-4" }}
                        >
                           <div className="flex w-full items-start justify-between">
                              <div className="flex flex-col items-start">
                                 <div className="mb-2 text-lg">{label}</div>
                                 <div className="flex items-center">
                                    <div className="text-2xl font-bold">
                                       <CountUp end={count ?? 0} separator="," />
                                       <span className="ml-2 text-xs font-normal text-neutral-500">Yêu cầu</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center">{icon}</div>
                           </div>
                        </Card>
                     ))}
                  </Panel>
               </Collapse>
            </section>
         </div>
      </div>
   )
}
