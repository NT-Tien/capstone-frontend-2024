"use client"

import RootHeader from "@/common/components/RootHeader"
import { ClockCircleOutlined, RightOutlined } from "@ant-design/icons"
import { Affix, Button, Card, Empty, Flex, Tabs, Typography } from "antd"
import React, { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequestStatus } from "@/common/enum/issue-request-status.enum"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import Head_Request_All from "@/app/head/_api/request/all.api"
import { useTranslation } from "react-i18next"
import head_qk from "@/app/head/_api/qk"
import ReportCard from "@/app/head/_components/ReportCard"
import extended_dayjs from "@/config/dayjs.config"
import { Hourglass, ThumbsUp, XCircle } from "@phosphor-icons/react"

export default function RequestsPage() {
   const results = useQuery({
      queryKey: head_qk.requests.all(),
      queryFn: () => Head_Request_All(),
   })
   const { t } = useTranslation()
   const [tab, setTab] = useState<string>("pending")

   const datasets = useMemo(() => {
      const result: {
         PENDING: FixRequestDto[]
         APPROVED: FixRequestDto[]
         REJECTED: FixRequestDto[]
      } = {
         PENDING: [],
         APPROVED: [],
         REJECTED: [],
      }

      if (!results.isSuccess) return result

      results.data.forEach((req) => {
         result[req.status].push(req)
      })

      return result
   }, [results.isSuccess, results.data])

   return (
      <div className="std-layout h-full pb-32">
         <RootHeader title={t("MyRequests")} className="std-layout-outer p-4" icon={<ClockCircleOutlined />} />
         <Affix offsetTop={0} className="std-layout-outer">
            <Tabs
               rootClassName="std-layout-outer"
               className="main-tabs"
               type="line"
               activeKey={tab}
               onChange={(key) => setTab(key)}
               items={[
                  {
                     key: "pending",
                     label: (
                        <div className="flex items-center gap-1">
                           <Hourglass size={14} className="mr-1" />
                           {t("pending")} <span className="text-xs text-gray-600">({datasets.PENDING.length})</span>
                        </div>
                     ),
                  },
                  {
                     key: "completed",
                     label: (
                        <div className="flex items-center gap-1">
                           <ThumbsUp size={14} className="mr-1" />
                           {t("Completed")} <span className="text-xs text-gray-600">({datasets.APPROVED.length})</span>
                        </div>
                     ),
                  },
                  {
                     key: "rejected",
                     label: (
                        <div className="flex items-center gap-1">
                           <XCircle size={14} />
                           {t("rejected")} <span className="text-xs text-gray-600">({datasets.REJECTED.length})</span>
                        </div>
                     ),
                  },
               ]}
            />
         </Affix>
         <IssueList
            statusName={tab}
            isLoading={results.isLoading}
            data={tab === "pending" ? datasets.PENDING : tab === "completed" ? datasets.APPROVED : datasets.REJECTED}
         />
      </div>
   )
}

type IssueListProps =
   | {
        statusName: string
        data: FixRequestDto[]
        isLoading: false | boolean
     }
   | {
        statusName: string
        data: null
        isLoading: true
     }

function IssueList({ data, isLoading, statusName }: IssueListProps) {
   const router = useRouter()

   return (
      <div className="grid grid-cols-1 gap-2">
         {isLoading && <Card loading />}
         {!isLoading && (
            <>
               {data.length === 0 && (
                  <Card className="h-full">
                     <Empty description={`You have no ${statusName} reports`}></Empty>
                  </Card>
               )}
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
   )
}
