"use client"

import { Button, Card, Empty, Skeleton, Typography } from "antd"
import { ClockCircleOutline } from "antd-mobile-icons"
import React from "react"
import HomeHeader from "@/common/components/HomeHeader"
import { useQuery } from "@tanstack/react-query"
import { PlusOutlined, QrcodeOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Head_Request_All from "@/app/head/_api/request/all.api"
import { useTranslation } from "react-i18next"
import { useIssueRequestStatusTranslation } from "@/common/enum/use-issue-request-status-translation"
import head_qk from "@/app/head/_api/qk"
import ReportCard from "@/app/head/_components/ReportCard"
import { StatisticCard } from "@ant-design/pro-card"
import CountUp from "react-countup"
import extended_dayjs from "@/config/dayjs.config"

export default function HeadDashboardPage() {
   const { t } = useTranslation()
   const { getStatusTranslation } = useIssueRequestStatusTranslation()
   const router = useRouter()
   const result = useQuery({
      queryKey: head_qk.requests.all(),
      queryFn: () => Head_Request_All(),
      select: (data) => data.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt))).slice(0, 4),
   })

   return (
      <div className="std-layout">
         <HomeHeader className="pb-8 pt-4" />
         <section className="std-layout-inner grid h-min grid-cols-3 gap-3">
            <Button
               className="col-span-1 flex aspect-square h-full w-full flex-col items-center justify-center gap-2"
               type="dashed"
               onClick={() => router.push("/head/scan")}
            >
               <QrcodeOutlined className="text-2xl" />
               <span className="ml-0 text-wrap text-center text-sm">{t("Start Scan")}</span>
            </Button>
            <StatisticCard
               className="col-span-2 h-full w-full"
               loading={result.isLoading}
               statistic={{
                  title: "Issues Reported",
                  value: result.data?.length ?? 0,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
         </section>
         <section className="std-layout-inner mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ClockCircleOutline />
               <Typography.Title level={5} className="mb-0">
                  {t("PrevReports")}
               </Typography.Title>
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
                           key={req.id}
                           id={req.id}
                           positionX={req.device.positionX}
                           positionY={req.device.positionY}
                           area={req.device.area.name}
                           machineModelName={req.device.machineModel.name}
                           createdDate={extended_dayjs(req.createdAt).fromNow()}
                           onClick={(id: string) => router.push(`/head/history/${id}`)}
                           status={req.status}
                           index={index}
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
