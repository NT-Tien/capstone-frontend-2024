"use client"

import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_All30Days from "@/app/head-staff/_api/request/all30Days.api"
import head_qk from "@/app/head/_api/qk"
import Head_Request_All from "@/app/head/_api/request/all.api"
import ColumnChart from "@/common/components/ChartComponent"
import HomeHeader from "@/common/components/HomeHeader"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { ArrowUpOutlined } from "@ant-design/icons"
import { StatisticCard } from "@ant-design/pro-card"
import { ProCard } from "@ant-design/pro-components"
import { CalendarCheck, CalendarSlash, Gear, HourglassSimpleMedium, NotePencil, SealCheck, Timer } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { Card, Col, Collapse, Row, Typography } from "antd"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useState } from "react"
import CountUp from "react-countup"

function useRequest(current: number, pageSize: number, currentStatus: FixRequestStatus) {
   return useQuery({
      queryKey: head_qk.requests.all(),
      queryFn: () => Head_Request_All(),
   })
}

function Page() {
   const router = useRouter()
   const currentDefault = 1,
      pageSizeDefault = 10

   const searchParams = useSearchParams()
   const [current, setCurrent] = useState(Number(searchParams.get("current")) || currentDefault)
   const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || pageSizeDefault)

   const requestPending = useRequest(current, pageSize, FixRequestStatus.PENDING)
   const requestApproved = useRequest(current, pageSize, FixRequestStatus.APPROVED)
   const requestInProgress = useRequest(current, pageSize, FixRequestStatus.IN_PROGRESS)
   const requestClosed = useRequest(current, pageSize, FixRequestStatus.CLOSED)
   const requestRejected = useRequest(current, pageSize, FixRequestStatus.REJECTED)

   const totalRequests = [
      requestPending.data?.length ?? 0,
      requestApproved.data?.length ?? 0,
      requestInProgress.data?.length ?? 0,
      requestClosed.data?.length ?? 0,
      requestRejected.data?.length ?? 0,
   ].reduce((acc, curr) => acc + curr, 0)

   const pendingRequest = requestPending.data?.length ?? 0
   const approvedRequest = requestApproved.data?.length ?? 0
   const inProgressRequest = requestInProgress.data?.length ?? 0
   const closedRequest = requestClosed.data?.length ?? 0
   const rejectedRequest = requestRejected.data?.length ?? 0

   return (
      <div>
         <div>
            <div className="std-layout">
               <HomeHeader className="pb-8 pt-4" />
            </div>
         </div>
         <div className="std-layout">
            <section className="mt-5 flex-none space-y-4">
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-orange-200 border-2 border-neutral-300 p-0 text-center shadow-md"
                  loading={
                     requestPending.isLoading ||
                     requestInProgress.isLoading ||
                     requestApproved.isLoading ||
                     requestRejected.isLoading ||
                     requestClosed.isLoading
                  }
                  onClick={() => router.push("history")}
                  classNames={{
                     body: "w-full",
                  }}
               >
                  <div className="flex w-full items-center justify-between">
                     <div className="flex flex-col items-start">
                        <div className="flex items-center">
                           <div className="text-3xl font-bold">
                              <CountUp end={totalRequests} separator={","} />
                           </div>
                        </div>
                        <div className="text-xl">Tổng cộng</div>
                     </div>
                     <div className="flex items-center">
                        <Gear size={45} weight="duotone"/>
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-neutral-200 border-2 border-neutral-300 p-0 text-center shadow-md"
                  loading={requestPending.isLoading}
                  onClick={() => router.push("history")}
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
                        <div className="text-xl">Chưa xử lý</div>
                     </div>
                     <div className="flex items-center">
                        <NotePencil size={45} weight="duotone" />
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-green-200 border-2 border-neutral-300 p-0 text-center shadow-md"
                  loading={requestApproved.isLoading}
                  onClick={() => router.push("history")}
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
                        <div className="text-xl">Xác nhận</div>
                     </div>
                     <div className="flex items-center">
                        <CalendarCheck size={45} />
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-blue-200 border-2 border-neutral-300 p-0 text-center shadow-md"
                  loading={requestInProgress.isLoading}
                  onClick={() => router.push("history")}
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
                        <div className="text-xl">Đang thực hiện</div>
                     </div>
                     <div className="flex items-center">
                        <HourglassSimpleMedium size={45} weight="duotone" />
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-purple-200 border-2 border-neutral-300 p-0 text-center shadow-md"
                  loading={requestClosed.isLoading}
                  onClick={() => router.push("history")}
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
                        <div className="text-xl">Đóng</div>
                     </div>
                     <div className="flex items-center">
                        <SealCheck size={45} />
                     </div>
                  </div>
               </Card>
               <Card
                  className="mt-5 flex h-24 w-full items-center justify-between rounded-lg bg-red-200 border-2 border-neutral-300 p-0 text-center shadow-md"
                  loading={requestRejected.isLoading}
                  onClick={() => router.push("history")}
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
                        <CalendarSlash size={45} weight="duotone" />
                     </div>
                  </div>
               </Card>
               {/* <StatisticCard
                  className="relative flex h-40 w-full items-center justify-center rounded-[2rem] bg-gradient-to-b from-[#FEFEFE] via-[#F5F7EC] to-[#D3E2A1] p-4 text-center shadow-fb"
                  loading={api_requests.isLoading}
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Tổng cộng</Row>
                        <Row className="flex items-center">
                           <div className="text-3xl font-bold">
                              <CountUp end={api_requests.data?.length ?? 0} separator={","} />
                           </div>
                           {/* <div>
                                 <ArrowRightOutlined />
                              </div>
                        </Row>
                     </Col>
                  </div>
               </StatisticCard>
               <StatisticCard
                  className="flex h-40 w-full items-center justify-center rounded-[2rem] p-4 text-center shadow-fb"
                  style={{
                     backgroundImage: "linear-gradient(135deg, #F7F9EB 40%, #E5EFCA 60%, #D9E6B1 80%, #D6E3AB)",
                  }}
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Đã duyệt</Row>
                        <Row className="text-3xl font-bold">
                           <CountUp
                              end={
                                 api_requests.data?.filter(
                                    (value: FixRequestDto) =>
                                       value.status === FixRequestStatus.APPROVED ||
                                       value.status === FixRequestStatus.IN_PROGRESS,
                                 ).length ?? 0
                              }
                              separator={","}
                           />
                        </Row>
                     </Col>
                  </div>
               </StatisticCard>
               <StatisticCard
                  className="flex h-40 w-full items-center justify-center rounded-[2rem] p-4 text-center shadow-fb"
                  style={{
                     backgroundImage: "linear-gradient(-135deg, #FEFEFE, #F5F7EC, #D7E4AC, #D3E2A1)",
                  }}
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Đang chờ</Row>
                        <Row className="text-3xl font-bold">
                           <CountUp
                              end={
                                 api_requests.data?.filter(
                                    (value: FixRequestDto) => value.status === FixRequestStatus.PENDING,
                                 ).length ?? 0
                              }
                              separator={","}
                           />
                        </Row>
                     </Col>
                  </div>
               </StatisticCard>
               <StatisticCard
                  className="relative flex h-40 w-full items-end justify-start rounded-[2rem] p-4 text-left shadow-fb"
                  style={{
                     backgroundImage: "linear-gradient(to bottom, #D3E2A1, #D7E4AC, #F5F7EC, #FEFEFE)",
                  }}
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Chờ đánh giá</Row>
                        <Row className="text-3xl font-bold">
                           <CountUp
                              end={
                                 api_requests.data?.filter(
                                    (value: FixRequestDto) => value.status === FixRequestStatus.HEAD_CONFIRM,
                                 ).length ?? 0
                              }
                              separator={","}
                           />
                        </Row>
                     </Col>
                  </div>
               </StatisticCard> */}
            </section>
            {/* <section className="mt-8">
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
            </section> */}
         </div>
      </div>
   )
}

export default Page
