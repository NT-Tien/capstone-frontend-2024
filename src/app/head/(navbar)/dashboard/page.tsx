"use client"

import head_qk from "@/app/head/_api/qk"
import Head_Request_All from "@/app/head/_api/request/all.api"
import ColumnChart from "@/common/components/ChartComponent"
import HomeHeader from "@/common/components/HomeHeader"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { ArrowUpOutlined } from "@ant-design/icons"
import { StatisticCard } from "@ant-design/pro-card"
import { ProCard } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import { Col, Row, Typography } from "antd"
import CountUp from "react-countup"

function Page() {
   const api_requests = useQuery({
      queryKey: head_qk.requests.all(),
      queryFn: () => Head_Request_All(),
      // select: (data) =>
      //    data.sort((a, b) => dayjs(b.createdAt).add(7, "hours").diff(dayjs(a.createdAt).add(7, "hours"))).slice(0, 4),
   })

   return (
      <div>
         <div style={{ backgroundImage: "linear-gradient(to right, #579A0D, #1C6014)" }}>
            <div className="std-layout">
               <HomeHeader className="pb-8 pt-4" />
            </div>
         </div>
         <div className="std-layout">
            <section className="mt-5 grid grid-cols-2 gap-4">
               <StatisticCard
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
                              </div> */}
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
               </StatisticCard>
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