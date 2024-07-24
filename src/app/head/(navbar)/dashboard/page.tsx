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
import { useTranslation } from "react-i18next"
import head_qk from "@/app/head/_api/qk"
import ReportCard from "@/common/components/ReportCard"
import { StatisticCard } from "@ant-design/pro-card"
import CountUp from "react-countup"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"

export default function HeadDashboardPage() {
   const { t } = useTranslation()
   const router = useRouter()
   const result = useQuery({
      queryKey: head_qk.requests.all(),
      queryFn: () => Head_Request_All(),
      select: (data) => data.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt))).slice(0, 4),
   })

   return (
      <div className="std-layout">
         <HomeHeader className="pb-8 pt-4" />
         <section className="flex space-x-4">
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               loading={result.isLoading}
               statistic={{
                  title: t("Total"),
                  value: result.data?.length ?? 0,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               statistic={{
                  title: t("Fixed"),
                  value:
                     result.data?.filter((value: FixRequestDto) => value.status === FixRequestStatus.APPROVED).length ??
                     0,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               statistic={{
                  title: t("Maintenance"),
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
               <h2 className="text-lg font-semibold">{t("PrevReports")}</h2>
            </div>
            <Link href="/head/history">
               <Button type="link" className="p-0">
                  {t("SeeMore")}
               </Button>
            </Link>
         </section>
         <div className="std-layout-inner mt-1.5 grid grid-cols-1 gap-3">
            {result.isSuccess ? (
               <>
                  {result.data.length === 0 && (
                     <Card>
                        <Empty description="You have no previous reports">
                           <Link href="/head/scan">
                              <Button icon={<PlusOutlined />} type="primary">
                                 Scan QR to Create Report
                              </Button>
                           </Link>
                        </Empty>
                     </Card>
                  )}
                  {result.data.length > 0 &&
                     result.data.map((req, index) => (
                        <ReportCard
                           index={index}
                           key={req.id}
                           id={req.id}
                           positionX={req.device.positionX}
                           positionY={req.device.positionY}
                           area={req.device.area.name}
                           machineModelName={req.device.machineModel.name}
                           createdDate={dayjs(req.createdAt).add(7, "hours").fromNow()}
                           onClick={(id: string) => router.push(`/head/history/${id}`)}
                           status={req.status}
                        />
                     ))}
               </>
            ) : (
               <>
                  {result.isLoading && <Card loading />}
                  {result.isError && <div>An error has occurred. Please try again</div>}
               </>
            )}
         </div>
      </div>
   )
}
