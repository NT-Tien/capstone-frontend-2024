"use client"

import { Button, Card, Col, Empty, Row } from "antd"
import React from "react"
import HomeHeader from "@/common/components/HomeHeader"
import { useQuery } from "@tanstack/react-query"
import { ClockCircleOutlined, PlusOutlined, ArrowRightOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Head_Request_All from "@/app/head/_api/request/all.api"
import head_qk from "@/app/head/_api/qk"
import ReportCard from "@/common/components/ReportCard"
import { StatisticCard } from "@ant-design/pro-card"
import CountUp from "react-countup"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import RequestCard from "@/app/head/_components/RequestCard"

export default function HeadDashboardPage() {
   const router = useRouter()
   const result = useQuery({
      queryKey: head_qk.requests.all(),
      queryFn: () => Head_Request_All(),
      select: (data) =>
         data.sort((a, b) => dayjs(b.createdAt).add(7, "hours").diff(dayjs(a.createdAt).add(7, "hours"))).slice(0, 4),
   })

   return (
      <div>
         <div style={{ backgroundImage: "linear-gradient(to right, #579A0D, #1C6014)" }}>
            <div className="std-layout">
               <HomeHeader className="pb-8 pt-4" />
            </div>
         </div>
         <div className="std-layout">
            <section className="grid grid-cols-2 gap-4 mt-5">
               <StatisticCard
                  className="relative flex h-40 w-full items-center justify-center rounded-[2rem] bg-gradient-to-b from-[#FEFEFE] via-[#F5F7EC] to-[#D3E2A1] p-4 text-center shadow-fb"
                  loading={result.isLoading}
               >
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                     <Col>
                        <Row className="text-2xl font-medium">Tổng cộng</Row>
                        <Row className="flex items-center">
                           <div className="text-3xl font-bold">
                              <CountUp end={result.data?.length ?? 0} separator={","} />
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
                                 result.data?.filter(
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
                                 result.data?.filter(
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
                                 result.data?.filter(
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
            <section className="std-layout-inner mt-8 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <ClockCircleOutlined />
                  <h2 className="text-lg font-semibold">Báo cáo gần đây</h2>
               </div>
               <Link href="/head/history">
                  <Button type="link" className="p-0">
                     Xem thêm
                  </Button>
               </Link>
            </section>
            <div className="std-layout-inner mt-1.5 grid grid-cols-1 gap-3">
               {result.isSuccess ? (
                  <>
                     {result.data.length === 0 && (
                        <Card>
                           <Empty description="Bạn không có báo cáo gần đây">
                              <Link href="/head/scan">
                                 <Button icon={<PlusOutlined />} type="primary">
                                    Quét mã QR để tạo báo cáo
                                 </Button>
                              </Link>
                           </Empty>
                        </Card>
                     )}
                     {result.data.length > 0 &&
                        result.data.map((req, index) => (
                           <RequestCard
                              dto={req}
                              index={index}
                              key={req.id}
                              id={req.id}
                              positionX={req.device.positionX}
                              positionY={req.device.positionY}
                              area={req.device.area.name}
                              machineModelName={req.device.machineModel.name}
                              createdDate={dayjs(req.createdAt).locale("vi").add(7, "hours").fromNow()}
                              onClick={(id: string) => router.push(`/head/history/${id}`)}
                              status={req.status}
                           />
                        ))}
                  </>
               ) : (
                  <>
                     {result.isLoading && <Card loading />}
                     {result.isError && <div>Đã xảy ra lỗi. Vui lòng thử lại</div>}
                  </>
               )}
            </div>
         </div>
      </div>
   )
}
