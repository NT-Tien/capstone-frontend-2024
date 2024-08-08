"use client"

import { Button, Card, Empty } from "antd"
import React from "react"
import HomeHeader from "@/common/components/HomeHeader"
import { useQuery } from "@tanstack/react-query"
import { ClockCircleOutlined, PlusOutlined } from "@ant-design/icons"
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
      <div className="std-layout">
         <HomeHeader className="pb-8 pt-4" />
         <section className="flex space-x-4">
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               loading={result.isLoading}
               statistic={{
                  title: "Tổng",
                  value: result.data?.length ?? 0,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               statistic={{
                  title: "Đã duyệt",
                  value:
                     result.data?.filter(
                        (value: FixRequestDto) =>
                           value.status === FixRequestStatus.APPROVED || value.status === FixRequestStatus.IN_PROGRESS,
                     ).length ?? 0,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               statistic={{
                  title: "Đang chờ",
                  value:
                     result.data?.filter((value: FixRequestDto) => value.status === FixRequestStatus.PENDING).length ??
                     0,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
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
   )
}
