"use client"

import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_All30Days from "@/app/head-staff/_api/request/all30Days.api"
import HeadStaff_Task_All from "@/app/head-staff/_api/task/all.api"
import ColumnChart from "@/common/components/ChartComponent"
import HomeHeader from "@/common/components/HomeHeader"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { ArrowUpOutlined } from "@ant-design/icons"
import { ProCard, StatisticCard } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import { Card, Col, Collapse, Row, Spin, Typography } from "antd"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import CountUp from "react-countup"
import { useRouter } from "next/navigation"
import {
   BellSimpleRinging,
   CalendarCheck,
   CalendarSlash,
   CheckSquareOffset,
   Gear,
   NotePencil,
   SealCheck,
   Sphere,
   Timer,
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
         <div style={{ backgroundImage: "linear-gradient(to right, #579A0D, #1C6014)" }}>
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
               >
                  <div className="bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row>
                           <CheckSquareOffset className="mb-3" size={45} weight="duotone" />
                        </Row>
                        <Row className="text-2xl font-medium">Tổng cộng</Row>
                        <Row>
                           <CountUp className="flex align-bottom text-3xl font-bold" end={totalTasks} separator={","} />
                           <Typography.Text className="flex items-end"> tác vụ</Typography.Text>
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
               >
                  <div className="bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        {/* <Row>
                           <Timer className="mb-3" size={45} weight="duotone" />
                        </Row> */}
                        <Row className="text-2xl font-medium">Tổng cộng</Row>
                        <Row>
                           <CountUp className="text-3xl font-bold" end={totalRequests} separator={","} />
                           <Typography.Text className="flex items-end"> yêu cầu</Typography.Text>
                        </Row>
                     </Col>
                  </div>
               </Card>
            </section>
            <section className="mt-5 space-y-4">
               <Collapse accordion className="bg-white">
                  <Panel header="Task" key="1" className="flex-none text-xl font-medium">
                     <Card
                        className="flex h-24 w-full items-center justify-between rounded-lg bg-neutral-50 p-0 text-center shadow-md"
                        loading={assignedResult.isLoading}
                        onClick={() => router.push("tasks")}
                        classNames={{
                           body: "w-full",
                        }}
                     >
                        <div className="flex w-full items-center justify-between">
                           <div className="flex flex-col items-start">
                              <div className="flex items-center">
                                 <div className="text-3xl font-bold">
                                    <CountUp end={assignedTasks} separator={","} />
                                 </div>
                              </div>
                              <div className="text-xl">Đã giao</div>
                           </div>
                           <div className="flex items-center">
                              <CalendarCheck size={45} weight="duotone" />
                           </div>
                        </div>
                     </Card>
                     <Card
                        className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-neutral-50 p-0 text-center shadow-md"
                        loading={inProgressResult.isLoading}
                        onClick={() => router.push("tasks")}
                        classNames={{
                           body: "w-full",
                        }}
                     >
                        <div className="flex w-full items-center justify-between">
                           <div className="flex flex-col items-start">
                              <div className="flex items-center">
                                 <div className="text-3xl font-bold">
                                    <CountUp end={progressingTasks} separator={","} />
                                 </div>
                              </div>
                              <div className="text-xl">Đang tiến hành</div>
                           </div>
                           <div className="flex items-center">
                              <Timer size={45} weight="duotone" className="text-blue-500" />
                           </div>
                        </div>
                     </Card>
                     <Card
                        className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-neutral-50 p-0 text-center shadow-md"
                        loading={completedResult.isLoading}
                        onClick={() => router.push("tasks")}
                        classNames={{
                           body: "w-full",
                        }}
                     >
                        <div className="flex w-full items-center justify-between">
                           <div className="flex flex-col items-start">
                              <div className="flex items-center">
                                 <div className="text-3xl font-bold">
                                    <CountUp end={completedTasks} separator={","} />
                                 </div>
                              </div>
                              <div className="text-xl">Hoàn thành</div>
                           </div>
                           <div className="flex items-center">
                              <SealCheck size={45} weight="duotone" className="text-blue-500" />
                           </div>
                        </div>
                     </Card>
                     <Card
                        className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-neutral-50 p-0 text-center shadow-md"
                        loading={headstaffConfirmResult.isLoading}
                        onClick={() => router.push("tasks")}
                        classNames={{
                           body: "w-full",
                        }}
                     >
                        <div className="flex w-full items-center justify-between">
                           <div className="flex flex-col items-start">
                              <div className="flex items-center">
                                 <div className="text-3xl font-bold">
                                    <CountUp end={headstaffConfirmTasks} separator={","} />
                                 </div>
                              </div>
                              <div className="text-xl">Chờ đánh giá</div>
                           </div>
                           <div className="flex items-center">
                              <NotePencil size={45} weight="duotone" />{" "}
                           </div>
                        </div>
                     </Card>
                     <Card
                        className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-neutral-50 p-0 text-center shadow-md"
                        loading={cancelledResult.isLoading}
                        onClick={() => router.push("tasks")}
                        classNames={{
                           body: "w-full",
                        }}
                     >
                        <div className="flex w-full items-center justify-between">
                           <div className="flex flex-col items-start">
                              <div className="flex items-center">
                                 <div className="text-3xl font-bold">
                                    <CountUp end={cancelledTasks} separator={","} />
                                 </div>
                              </div>
                              <div className="text-xl">Đã hủy</div>
                           </div>
                           <div className="flex items-center">
                              <CalendarSlash size={45} weight="duotone" className="text-blue-500" />
                           </div>
                        </div>
                     </Card>
                  </Panel>
               </Collapse>
               <Collapse accordion className="bg-white">
                  <Panel header="Request" key="1" className="flex-none text-xl font-medium">
                     <Card
                        className="flex h-24 w-full items-center justify-between rounded-lg bg-neutral-50 p-0 text-center shadow-md"
                        loading={requestPending.isLoading}
                        onClick={() => router.push("requests?status=PENDING")}
                        classNames={{
                           body: "w-full",
                        }}
                     >
                        <div className="flex w-full items-center justify-between">
                           <div className="flex flex-col items-start">
                              <div className="flex items-center">
                                 <div className="text-3xl font-bold">
                                    <CountUp end={pendingRequest} separator={","} />
                                 </div>
                              </div>
                              <div className="text-xl">Đang chờ</div>
                           </div>
                           <div className="flex items-center">
                              <NotePencil size={45} weight="duotone" />
                           </div>
                        </div>
                     </Card>
                     <Card
                        className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-neutral-50 p-0 text-center shadow-md"
                        loading={requestApproved.isLoading}
                        onClick={() => router.push("requests?status=APPROVED")}
                        classNames={{
                           body: "w-full",
                        }}
                     >
                        <div className="flex w-full items-center justify-between">
                           <div className="flex flex-col items-start">
                              <div className="flex items-center">
                                 <div className="text-3xl font-bold">
                                    <CountUp end={approvedRequest} separator={","} />
                                 </div>
                              </div>
                              <div className="text-xl">Đã duyệt</div>
                           </div>
                           <div className="flex items-center">
                              <CalendarCheck size={45} weight="duotone" className="text-blue-500" />
                           </div>
                        </div>
                     </Card>
                     <Card
                        className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-neutral-50 p-0 text-center shadow-md"
                        loading={requestInProgress.isLoading}
                        onClick={() => router.push("requests?status=IN_PROGRESS")}
                        classNames={{
                           body: "w-full",
                        }}
                     >
                        <div className="flex w-full items-center justify-between">
                           <div className="flex flex-col items-start">
                              <div className="flex items-center">
                                 <div className="text-3xl font-bold">
                                    <CountUp end={inProgressRequest} separator={","} />
                                 </div>
                              </div>
                              <div className="text-xl">Đang tiến hành</div>
                           </div>
                           <div className="flex items-center">
                              <Timer size={45} weight="duotone" className="text-blue-500" />
                           </div>
                        </div>
                     </Card>
                     <Card
                        className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-neutral-50 p-0 text-center shadow-md"
                        loading={requestClosed.isLoading}
                        onClick={() => router.push("requests?status=CLOSED")}
                        classNames={{
                           body: "w-full",
                        }}
                     >
                        <div className="flex w-full items-center justify-between">
                           <div className="flex flex-col items-start">
                              <div className="flex items-center">
                                 <div className="text-3xl font-bold">
                                    <CountUp end={closedRequest} separator={","} />
                                 </div>
                              </div>
                              <div className="text-xl">Hoàn thành</div>
                           </div>
                           <div className="flex items-center">
                              <SealCheck size={45} weight="duotone" className="text-blue-500" />
                           </div>
                        </div>
                     </Card>
                     <Card
                        className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-neutral-50 p-0 text-center shadow-md"
                        loading={requestRejected.isLoading}
                        onClick={() => router.push("requests?status=REJECTED")}
                        classNames={{
                           body: "w-full",
                        }}
                     >
                        <div className="flex w-full items-center justify-between">
                           <div className="flex flex-col items-start">
                              <div className="flex items-center">
                                 <div className="text-3xl font-bold">
                                    <CountUp end={rejectedRequest} separator={","} />
                                 </div>
                              </div>
                              <div className="text-xl">Không tiếp nhận</div>
                           </div>
                           <div className="flex items-center">
                              <CalendarSlash size={45} weight="duotone" className="text-blue-500" />
                           </div>
                        </div>
                     </Card>
                  </Panel>
               </Collapse>
            </section>
         </div>
      </div>
   )
}
