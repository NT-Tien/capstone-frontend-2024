"use client"

import RootHeader from "@/common/components/RootHeader"
import { ClockCircleOutlined, RightOutlined } from "@ant-design/icons"
import { Button, Card, Empty, Flex, Tabs, Typography } from "antd"
import React from "react"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { IssueRequestDto } from "@/common/dto/IssueRequest.dto"
import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import Head_Request_All from "@/app/head/_api/request/all.api"
import { useTranslation } from "react-i18next"

export default function HistoryPage() {
   const results = useQuery({
      queryKey: qk.issueRequests.allRaw(),
      queryFn: () => Head_Request_All(),
   })
   const { t } = useTranslation()
   return (
      <div
         style={{
            display: "grid",
            gridTemplateColumns: "[outer-start] 16px [inner-start] 1fr [inner-end] 16px [outer-end] 0",
         }}
      >
         <RootHeader
            title="History"
            className="p-4"
            icon={<ClockCircleOutlined />}
            style={{
               gridColumn: "outer-start / outer-end",
            }}
         />
         <Tabs
            style={{
               gridColumn: "inner-start / inner-end",
            }}
            rootClassName="mt-4"
            type="card"
            items={[
               {
                  key: "pending",
                  label: t('pending'),
                  children: (
                     <IssueList
                        statusName="pending"
                        isLoading={results.isLoading}
                        data={results.data?.filter((req) => req.status === IssueRequestStatus.PENDING) || []}
                     />
                  ),
               },
               {
                  key: "completed",
                  label: t('Completed'),
                  children: (
                     <IssueList
                        statusName="completed"
                        isLoading={results.isLoading}
                        data={results.data?.filter((req) => req.status === IssueRequestStatus.APPROVED) || []}
                     />
                  ),
               },
               {
                  key: "rejected",
                  label: t('rejected'),
                  children: (
                     <IssueList
                        statusName="rejected"
                        isLoading={results.isLoading}
                        data={results.data?.filter((req) => req.status === IssueRequestStatus.REJECTED) || []}
                     />
                  ),
               },
            ]}
         />
      </div>
   )
}

type IssueListProps =
   | {
        statusName: string
        data: IssueRequestDto[]
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
      <div className="grid grid-cols-1 gap-3">
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
                     <Card
                        key={req.id}
                        size="small"
                        title={req.device.description}
                        bordered={true}
                        hoverable
                        type="inner"
                        classNames={{
                           header: "bg-[#FEF7FF]",
                        }}
                        onClick={() => router.push(`/head/history/${req.id}`)}
                        extra={
                           <div className="flex items-center gap-1">
                              <Button type="text" size="small" ghost icon={<RightOutlined />} />
                           </div>
                        }
                     >
                        <Flex justify="space-between" align="center">
                           <Typography.Text ellipsis={true}>{req.requester_note}</Typography.Text>
                           <Typography.Text className="text-xs">
                              {dayjs(req.createdAt).format("DD/MM/YYYY")}
                           </Typography.Text>
                        </Flex>
                     </Card>
                  ))}
            </>
         )}
      </div>
   )
}
