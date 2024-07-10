"use client"

import RootHeader from "@/common/components/RootHeader"
import { ClockCircleOutlined, RightOutlined } from "@ant-design/icons"
import { Button, Card, Empty, Flex, Tabs, Typography } from "antd"
import React, { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import Head_Request_All from "@/app/head/_api/request/all.api"
import { useTranslation } from "react-i18next"
import head_qk from "@/app/head/_api/qk"
import ReportCard from "@/app/head/_components/ReportCard"
import extended_dayjs from "@/config/dayjs.config"

export default function RequestsPage() {
   const results = useQuery({
      queryKey: head_qk.requests.all(),
      queryFn: () => Head_Request_All(),
   })
   const { t } = useTranslation()

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
      <div className="std-layout">
         <RootHeader title={t("MyRequests")} className="std-layout-outer p-4" icon={<ClockCircleOutlined />} />
         <Tabs
            rootClassName="std-layout-outer"
            className="main-tabs"
            type="line"
            items={[
               {
                  key: "tab-pending",
                  label: (
                     <div>
                        {t("pending")} <span className="text-sm text-gray-600">({datasets.PENDING.length})</span>
                     </div>
                  ),
                  children: <IssueList statusName="pending" isLoading={results.isLoading} data={datasets.PENDING} />,
               },
               {
                  key: "tab-completed",
                  label: (
                     <div>
                        {t("Completed")} <span className="text-sm text-gray-600">({datasets.APPROVED.length})</span>
                     </div>
                  ),
                  children: <IssueList statusName="completed" isLoading={results.isLoading} data={datasets.APPROVED} />,
               },
               {
                  key: "tab-rejected",
                  label: (
                     <div>
                        {t("rejected")} <span className="text-sm text-gray-600">({datasets.REJECTED.length})</span>
                     </div>
                  ),
                  children: <IssueList statusName="rejected" isLoading={results.isLoading} data={datasets.REJECTED} />,
               },
            ]}
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
                  <Card>
                     <Empty description={`You have no ${statusName} reports`}></Empty>
                  </Card>
               )}
               {data.length > 0 &&
                  data.map((req) => (
                     <ReportCard
                        key={req.id}
                        id={req.id}
                        positionX={req.device.positionX}
                        positionY={req.device.positionY}
                        area={req.device.area.name}
                        machineModelName={req.device.machineModel.name}
                        createdDate={extended_dayjs(req.createdAt).fromNow()}
                        onClick={(id: string) => router.push(`/head/history/${id}`)}
                     />
                  ))}
            </>
         )}
      </div>
   )
}
