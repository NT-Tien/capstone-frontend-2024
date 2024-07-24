"use client"

import RootHeader from "@/common/components/RootHeader"
import { ClockCircleOutlined } from "@ant-design/icons"
import { Card, Empty } from "antd"
import React, { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { useRouter } from "next/navigation"
import Head_Request_All from "@/app/head/_api/request/all.api"
import { useTranslation } from "react-i18next"
import head_qk from "@/app/head/_api/qk"
import ReportCard from "@/common/components/ReportCard"
import extended_dayjs from "@/config/dayjs.config"
import { CheckSquareOffset, Hourglass, ThumbsUp, Wrench, XCircle } from "@phosphor-icons/react"
import { cn } from "@/common/util/cn.util"
import ScrollableTabs from "@/common/components/ScrollableTabs"

export default function RequestsPage() {
   const results = useQuery({
      queryKey: head_qk.requests.all(),
      queryFn: () => Head_Request_All(),
   })
   const { t } = useTranslation()
   const [tab, setTab] = useState<FixRequestStatus>(FixRequestStatus.PENDING)

   const datasets = useMemo(() => {
      const result: {
         [key in FixRequestStatus]: FixRequestDto[]
      } = {
         PENDING: [],
         APPROVED: [],
         REJECTED: [],
         IN_PROGRESS: [],
         CLOSED: [],
      }

      if (!results.isSuccess) return result

      results.data.forEach((req) => {
         result[req.status].push(req)
      })

      return result
   }, [results.isSuccess, results.data])

   return (
      <div className="std-layout">
         <RootHeader title={t("MyRequests")} className="std-layout-outer p-4" icon={<ClockCircleOutlined />} />
         <ScrollableTabs
            className="std-layout-outer"
            classNames={{
               content: "mt-layout",
            }}
            tab={tab}
            onTabChange={setTab}
            items={[
               {
                  key: FixRequestStatus.PENDING,
                  title: t("pending"),
                  icon: <Hourglass size={16} />,
                  badge: datasets[FixRequestStatus.PENDING].length,
               },
               {
                  key: FixRequestStatus.APPROVED,
                  title: t("Completed"),
                  icon: <ThumbsUp size={16} />,
                  badge: datasets[FixRequestStatus.APPROVED].length,
               },
               {
                  key: FixRequestStatus.IN_PROGRESS,
                  title: "In Progress",
                  icon: <Wrench size={16} />,
                  badge: datasets[FixRequestStatus.IN_PROGRESS].length,
               },
               {
                  key: FixRequestStatus.CLOSED,
                  title: "Closed",
                  icon: <CheckSquareOffset size={16} />,
                  badge: datasets[FixRequestStatus.CLOSED].length,
               },
               {
                  key: FixRequestStatus.REJECTED,
                  title: t("rejected"),
                  icon: <XCircle size={16} />,
                  badge: datasets[FixRequestStatus.REJECTED].length,
               },
            ]}
         />
         <IssueList statusName={tab} isLoading={results.isLoading} data={datasets[tab]} className="mb-layout" />
      </div>
   )
}

type IssueListProps =
   | {
        statusName: string
        data: FixRequestDto[]
        isLoading: false | boolean
        className?: string
     }
   | {
        statusName: string
        data: null
        isLoading: true
        className?: string
     }

function IssueList({ data, isLoading, statusName, className }: IssueListProps) {
   const router = useRouter()

   return (
      <>
         {data && data.length === 0 && (
            <Card className="h-full">
               <Empty description={`You have no ${statusName} reports`}></Empty>
            </Card>
         )}
         <div className={cn("grid grid-cols-1 gap-2", className)}>
            {isLoading && <Card loading />}
            {!isLoading && (
               <>
                  {data.length > 0 &&
                     data.map((req, index) => (
                        <ReportCard
                           index={index}
                           key={req.id}
                           id={req.id}
                           positionX={req.device.positionX}
                           positionY={req.device.positionY}
                           area={req.device.area.name}
                           machineModelName={req.device.machineModel.name}
                           createdDate={extended_dayjs(req.createdAt).locale("en").fromNow()}
                           onClick={(id: string) => router.push(`/head/history/${id}`)}
                        />
                     ))}
               </>
            )}
         </div>
      </>
   )
}
