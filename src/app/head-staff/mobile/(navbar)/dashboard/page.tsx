"use client"

import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_All30Days from "@/app/head-staff/_api/request/all30Days.api"
import HeadStaff_Task_All from "@/app/head-staff/_api/task/all.api"
import HomeHeader from "@/common/components/HomeHeader"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { useQuery } from "@tanstack/react-query"
import { Card, Col, Collapse, Row, Spin, Typography } from "antd"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
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
   const currentDefault = 1,
      pageSizeDefault = 10

   const searchParams = useSearchParams()
   const [current, setCurrent] = useState(Number(searchParams.get("current")) || currentDefault)
   const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || pageSizeDefault)

   const awaitingFixerResult = useTask(current, pageSize, TaskStatus.AWAITING_FIXER)
   // const pendingStockResult = result(TaskStatus.PENDING_STOCK)
   const assignedResult = useTask(current, pageSize, TaskStatus.ASSIGNED)
   const inProgressResult = useTask(current, pageSize, TaskStatus.IN_PROGRESS)
   const headstaffConfirmResult = useTask(current, pageSize, TaskStatus.HEAD_STAFF_CONFIRM)
   const completedResult = useTask(current, pageSize, TaskStatus.COMPLETED)
   const cancelledResult = useTask(current, pageSize, TaskStatus.CANCELLED)

   const requestPending = useRequest(current, pageSize, FixRequestStatus.PENDING)
   const requestApproved = useRequest(current, pageSize, FixRequestStatus.APPROVED)
   const requestInProgress = useRequest(current, pageSize, FixRequestStatus.IN_PROGRESS)
   const requestClosed = useRequest(current, pageSize, FixRequestStatus.CLOSED)
   const requestRejected = useRequest(current, pageSize, FixRequestStatus.REJECTED)

   const totalTasks = [
      awaitingFixerResult.data?.total ?? 0,
      // pendingStockResult.data?.total ?? 0,
      assignedResult.data?.total ?? 0,
      inProgressResult.data?.total ?? 0,
      completedResult.data?.total ?? 0,
      headstaffConfirmResult.data?.total ?? 0,
      cancelledResult.data?.total ?? 0,
   ].reduce((acc, curr) => acc + curr, 0)

   const totalRequests = [
      requestPending.data?.total ?? 0,
      requestApproved.data?.total ?? 0,
      requestInProgress.data?.total ?? 0,
      requestClosed.data?.total ?? 0,
      requestRejected.data?.total ?? 0,
   ].reduce((acc, curr) => acc + curr, 0)

   const progressingTasks = inProgressResult.data?.list.length ?? 0
   const completedTasks = completedResult.data?.list.length ?? 0
   const headstaffConfirmTasks = headstaffConfirmResult.data?.list.length ?? 0
   const assignedTasks = assignedResult.data?.list.length ?? 0
   const cancelledTasks = cancelledResult.data?.list.length ?? 0

   const pendingRequest = requestPending.data?.list.length ?? 0
   const approvedRequest = requestApproved.data?.list.length ?? 0
   const inProgressRequest = requestInProgress.data?.list.length ?? 0
   const closedRequest = requestClosed.data?.list.length ?? 0
   const rejectedRequest = requestRejected.data?.list.length ?? 0

   const { Panel } = Collapse

   return (
      <div>
         <div>
            <div className="std-layout">
               <HomeHeader className="std-layout-inner pb-8 pt-4" />
            </div>
         </div>
         <div className="std-layout">
            <section className="mt-5 grid grid-cols-2 gap-4">
               <Card
                  loading={
                     awaitingFixerResult.isLoading ||
                     assignedResult.isLoading ||
                     inProgressResult.isLoading ||
                     completedResult.isLoading ||
                     cancelledResult.isLoading
                  }
                  onClick={() => router.push("tasks")}
                  className="border-2 shadow-lg"
               >
                  <div className="bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row>
                           <CheckSquareOffset className="mb-3" size={45} />
                        </Row>
                        <Row className="text-2xl font-medium">Tổng cộng</Row>
                        <Row>
                           <CountUp className="flex align-bottom text-3xl font-bold" end={totalTasks} separator={","} />
                           <Typography.Text className="m-2 flex items-end text-base">tác vụ</Typography.Text>
                        </Row>
                     </Col>
                  </div>
               </Card>
               <Card
                  loading={
                     requestPending.isLoading ||
                     requestInProgress.isLoading ||
                     requestApproved.isLoading ||
                     requestRejected.isLoading ||
                     requestClosed.isLoading
                  }
                  onClick={() => router.push("requests")}
                  className="border-2 shadow-lg"
               >
                  <div className="bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Note className="mb-3" size={45} weight="duotone" />
                        <Row className="text-2xl font-medium">Tổng cộng</Row>
                        <Row>
                           <CountUp className="text-3xl font-bold" end={totalRequests} separator={","} />
                           <Typography.Text className="m-2 flex items-end text-base"> yêu cầu</Typography.Text>
                        </Row>
                     </Col>
                  </div>
               </Card>
            </section>
            <section className="mt-5 space-y-4">
               <Collapse accordion className="bg-white">
                  <Panel header="Task" key="1" className="flex-none border-2 text-xl font-medium shadow-lg">
                     {[
                        {
                           loading: assignedResult.isLoading,
                           count: assignedTasks,
                           label: "Đã phân công",
                           icon: <CalendarCheck size={45} weight="duotone" />,
                           route: "tasks",
                           bgColor: "bg-blue-200"
                        },
                        {
                           loading: inProgressResult.isLoading,
                           count: progressingTasks,
                           label: "Đang làm",
                           icon: <HourglassSimpleMedium size={45} weight="duotone" />,
                           route: "tasks",
                           bgColor: "bg-orange-200"
                        },
                        {
                           loading: completedResult.isLoading,
                           count: completedTasks,
                           label: "Hoàn thành",
                           icon: <SealCheck size={45} />,
                           route: "tasks",
                           bgColor: "bg-green-300"
                        },
                        {
                           loading: headstaffConfirmResult.isLoading,
                           count: headstaffConfirmTasks,
                           label: "Chờ kiểm tra",
                           icon: <NotePencil size={45} weight="duotone" />,
                           route: "tasks",
                           bgColor: "bg-purple-200"
                        },
                        {
                           loading: cancelledResult.isLoading,
                           count: cancelledTasks,
                           label: "Đã hủy",
                           icon: <CalendarSlash size={45} weight="duotone" />,
                           route: "tasks",
                           bgColor: "bg-red-200"
                        },
                     ].map(({ loading, count, label, icon, route, bgColor }, index) => (
                        <Card
                           key={index}
                           className={`mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-neutral-200 p-0 text-center shadow-sm ${bgColor}`}
                           loading={loading}
                           onClick={() => router.push(route)}
                           classNames={{ body: "w-full" }}
                        >
                           <div className="flex w-full items-center justify-between">
                              <div className="flex flex-col items-start">
                                 <div className="flex items-center">
                                    <div className="text-3xl font-bold">
                                       <CountUp end={count} separator="," />
                                    </div>
                                 </div>
                                 <div className="text-xl">{label}</div>
                              </div>
                              <div className="flex items-center">{icon}</div>
                           </div>
                        </Card>
                     ))}
                  </Panel>
               </Collapse>

               <Collapse accordion className="bg-white">
                  <Panel header="Request" key="1" className="flex-none border-2 text-xl font-medium shadow-lg">
                     {[
                        {
                           loading: requestPending.isLoading,
                           count: pendingRequest,
                           label: "Chưa xử lý",
                           icon: <NotePencil size={45} weight="duotone" />,
                           route: "requests?status=PENDING",
                        },
                        {
                           loading: requestApproved.isLoading,
                           count: approvedRequest,
                           label: "Xác nhận",
                           icon: <CalendarCheck size={45} weight="duotone" />,
                           route: "requests?status=APPROVED",
                           bgColor: "bg-green-300"
                        },
                        {
                           loading: requestInProgress.isLoading,
                           count: inProgressRequest,
                           label: "Đang thực hiện",
                           icon: <HourglassSimpleMedium size={45} weight="duotone" />,
                           route: "requests?status=IN_PROGRESS",
                           bgColor: "bg-blue-300"
                        },
                        {
                           loading: requestClosed.isLoading,
                           count: closedRequest,
                           label: "Đóng",
                           icon: <SealCheck size={45} />,
                           route: "requests?status=CLOSED",
                           bgColor: "bg-purple-200"
                        },
                        {
                           loading: requestRejected.isLoading,
                           count: rejectedRequest,
                           label: "Không tiếp nhận",
                           icon: <CalendarSlash size={45} weight="duotone" />,
                           route: "requests?status=REJECTED",
                           bgColor: "bg-red-200"
                        },
                     ].map(({ loading, count, label, icon, route, bgColor }, index) => (
                        <Card
                           key={index}
                           className={`mt-5 flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-neutral-200 p-0 text-center shadow-sm ${bgColor}`}
                           loading={loading}
                           onClick={() => router.push(route)}
                           classNames={{ body: "w-full" }}
                        >
                           <div className="flex w-full items-center justify-between">
                              <div className="flex flex-col items-start">
                                 <div className="flex items-center">
                                    <div className="text-3xl font-bold">
                                       <CountUp end={count} separator="," />
                                    </div>
                                 </div>
                                 <div className="text-xl">{label}</div>
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
