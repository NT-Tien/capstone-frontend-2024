"use client"

import RootHeader from "@/common/components/RootHeader"
import { Card, Empty, Tabs } from "antd"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import HeadStaff_Request_All30Days from "@/app/head-staff/_api/request/all30Days.api"
import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"
import { useTranslation } from "react-i18next"
import ReportCard from "@/app/head/_components/ReportCard"
import React from "react"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"

export default function ReportsPage() {
   const { t } = useTranslation()

   return (
      <div className="std-layout overflow-y-auto">
         <RootHeader title="Requests" className="std-layout-outer p-4" />
         <Tabs
            type="line"
            className="main-tabs std-layout-outer"
            items={[
               {
                  key: "pending",
                  label: t("pending"),
                  children: <ReportsTab status={IssueRequestStatus.PENDING} />,
               },
               {
                  key: "approved",
                  label: t("approved"),
                  children: <ReportsTab status={IssueRequestStatus.APPROVED} />,
               },
               {
                  key: "rejected",
                  label: t("rejected"),
                  children: <ReportsTab status={IssueRequestStatus.REJECTED} />,
               },
            ]}
         />
      </div>
   )
}

type ReportsTabProps = {
   status: IssueRequestStatus
}

function ReportsTab(props: ReportsTabProps) {
   const { t } = useTranslation()
   const router = useRouter()
   const results = useQuery({
      queryKey: qk.issueRequests.all(1, 50, props.status),
      queryFn: () =>
         HeadStaff_Request_All30Days({
            page: 1,
            limit: 50,
            status: props.status,
         }),
   })

   return (
      <div className="grid grid-cols-1 gap-2">
         <div className="text-gray-500">
            {{
               [IssueRequestStatus.PENDING]: "Sorting by Creation Date (old - new)",
               [IssueRequestStatus.APPROVED]: "Sorting by Modified Date (new - old)",
               [IssueRequestStatus.REJECTED]: "Sorting by Modified Date (new - old)",
            }[props.status] || ""}
         </div>
         {results.isSuccess ? (
            <>
               {results.data.list.length !== 0 &&
                  results.data.list.map((req) => (
                     <ReportCard
                        key={req.id}
                        id={req.id}
                        positionX={req.device.positionX}
                        positionY={req.device.positionY}
                        area={req.device.area.name}
                        machineModelName={req.device?.machineModel?.name ?? "Test Machine"}
                        createdDate={dayjs(req.createdAt).format("DD/MM/YY - HH:mm")}
                        onClick={(id: string) => router.push(`/head-staff/requests/${id}`)}
                     />
                  ))}
               {results.data.list.length === 0 && (
                  <Empty description={t("noData")} image={Empty.PRESENTED_IMAGE_SIMPLE} />
               )}
            </>
         ) : (
            <>{results.isLoading && <Card loading />}</>
         )}
      </div>
   )
}
