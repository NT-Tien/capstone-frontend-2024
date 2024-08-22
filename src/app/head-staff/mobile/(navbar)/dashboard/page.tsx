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
import { Col, Row, Spin, Typography } from "antd"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import CountUp from "react-countup"
import { useRouter } from "next/navigation"

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

   const totalTasks = [
      awaitingFixerResult.data?.total ?? 0,
      // pendingStockResult.data?.total ?? 0,
      assignedResult.data?.total ?? 0,
      inProgressResult.data?.total ?? 0,
      completedResult.data?.total ?? 0,
      headstaffConfirmResult.data?.total ?? 0,
      cancelledResult.data?.total ?? 0,
   ].reduce((acc, curr) => acc + curr, 0)

   const progressingTasks = inProgressResult.data?.list.length ?? 0
   const completedTasks = completedResult.data?.list.length ?? 0
   const headstaffConfirmTasks = headstaffConfirmResult.data?.list.length ?? 0

   const pendingRequest = requestPending.data?.list.length ?? 0
   return (
      <div>
         <div style={{ backgroundImage: "linear-gradient(to right, #579A0D, #1C6014)" }}>
            <div className="std-layout">
               <HomeHeader className="std-layout-inner pb-8 pt-4" />
            </div>
         </div>
         <div className="std-layout">
            <section className="mt-5 grid grid-cols-2 gap-4">
               <StatisticCard
                  className="relative flex h-40 w-full items-center justify-center rounded-[2rem] bg-gradient-to-b from-[#FEFEFE] via-[#F5F7EC] to-[#D3E2A1] p-4 text-center shadow-fb"
                  loading={
                     awaitingFixerResult.isLoading ||
                     assignedResult.isLoading ||
                     inProgressResult.isLoading ||
                     completedResult.isLoading ||
                     cancelledResult.isLoading
                  }
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Tổng cộng</Row>
                        <Row className="flex items-center">
                           <div className="text-3xl font-bold">
                              <CountUp end={totalTasks} separator={","} />
                           </div>
                        </Row>
                     </Col>
                  </div>
               </StatisticCard>
               <StatisticCard
                  className="flex h-40 w-full items-center justify-center rounded-[2rem] p-4 text-center shadow-fb"
                  loading={inProgressResult.isLoading}
                  style={{
                     backgroundImage: "linear-gradient(135deg, #F7F9EB 40%, #E5EFCA 60%, #D9E6B1 80%, #D6E3AB)",
                  }}
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Thực hiện</Row>
                        <Row className="text-3xl font-bold">
                           <CountUp end={progressingTasks} separator={","} />
                        </Row>
                     </Col>
                  </div>
               </StatisticCard>
               <StatisticCard
                  className="flex h-40 w-full items-center justify-center rounded-[2rem] p-4 text-center shadow-fb"
                  loading={requestPending.isLoading}
                  style={{
                     backgroundImage: "linear-gradient(-135deg, #FEFEFE, #F5F7EC, #D7E4AC, #D3E2A1)",
                  }}
                  onClick={() => router.push("requests")}
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Chưa xử lý</Row>
                        <Row className="text-3xl font-bold">
                           <CountUp end={pendingRequest} separator={","} />
                        </Row>
                     </Col>
                  </div>
               </StatisticCard>
               <StatisticCard
                  className="relative flex h-40 w-full items-end justify-start rounded-[2rem] p-4 text-left shadow-fb"
                  loading={completedResult.isLoading}
                  style={{
                     backgroundImage: "linear-gradient(to bottom, #D3E2A1, #D7E4AC, #F5F7EC, #FEFEFE)",
                  }}
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Hoàn tất</Row>
                        <Row className="text-3xl font-bold">
                           <CountUp end={completedTasks} separator={","} />
                        </Row>
                     </Col>
                  </div>
               </StatisticCard>
            </section>
            <section className="mt-8">
               <ProCard
                  style={{
                     maxWidth: "100%",
                     borderRadius: "2rem",
                     position: "relative",
                     overflow: "hidden",
                  }}
                  boxShadow
               >
                  <Row style={{ display: "flex", justifyContent: "center" }}>
                     <Typography.Text className="text-2xl font-medium">Báo cáo hàng tuần</Typography.Text>
                  </Row>
                  <Row>
                     <Col
                        style={{
                           position: "relative",
                           height: "250px",
                           width: "250px",
                           bottom: "0",
                           left: "0",
                           display: "flex",
                           alignItems: "flex-end",
                        }}
                     >
                        <ColumnChart />
                     </Col>
                     <Col style={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                        <Typography.Text className="text-3xl font-medium" style={{ color: '#008B1A' }}>
                        <ArrowUpOutlined />
                           65%
                        </Typography.Text>
                     </Col>
                  </Row>
               </ProCard>
            </section>
            {/* <section className="std-layout-inner mt-8 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <ClockCircleOutlined />
                  <h2 className="text-lg font-semibold">Tác vụ gần đây</h2>
               </div>
               <Link href="/head-staff/mobile/tasks">
                  <Button type="link" className="p-0">
                     Xem tất cả
                  </Button>
               </Link>
            </section>
            <div>
               {completedResult.data?.list.length === 0 ? (
                  <Card className="mt-2.5">
                     <Empty description="Không có tác vụ" />
                  </Card>
               ) : (
                  completedResult.data?.list.map((task) => (
                     <TaskCard
                        className="std-layout-inner mt-2.5 grid grid-cols-1 gap-10"
                        title={task.name}
                        description={`Est. ${task.totalTime} minutes`}
                        key={task.id}
                        extra={
                           <Typography.Text className="text-gray-500">
                              {extended_dayjs(task.createdAt).add(7, "hours").locale("en").fromNow(false)}
                           </Typography.Text>
                        }
                     />
                  ))
               )}
            </div> */}
         </div>
      </div>
   )
}