"use client"

import RootHeader from "@/common/components/RootHeader"
import { Card, Empty, Tabs } from "antd"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import HeadStaff_Request_All30Days from "@/app/head-staff/_api/request/all30Days.api"
import { FixRequestStatus } from "@/common/enum/issue-request-status.enum"
import { useTranslation } from "react-i18next"
import ReportCard from "@/common/components/ReportCard"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { Hourglass, ThumbsUp, XCircle } from "@phosphor-icons/react"

const TabMap: { [key: string]: FixRequestStatus } = {
   pending: FixRequestStatus.PENDING,
   approved: FixRequestStatus.APPROVED,
   rejected: FixRequestStatus.REJECTED,
}

export default function ReportsPage() {
   const { t } = useTranslation()
   const [tab, setTab] = useState<string>("pending")

   return (
      <div className="std-layout">
         <RootHeader title="Yêu cầu" className="std-layout-outer p-4" />
         <Tabs
            type="line"
            activeKey={tab}
            onChange={(key) => setTab(key)}
            rootClassName="std-layout-outer sticky top-0 z-50"
            className="main-tabs"
            items={[
               {
                  key: "pending",
                  label: (
                     <div className="flex items-center gap-1">
                        <Hourglass size={14} className="mr-1" />
                        Đang chờ
                     </div>
                  ),
               },
               {
                  key: "approved",
                  label: (
                     <div className="flex items-center gap-1">
                        <ThumbsUp size={14} className="mr-1" />
                        Hoàn thành
                     </div>
                  ),
               },
               {
                  key: "rejected",
                  label: (
                     <div className="flex items-center gap-1">
                        <XCircle size={14} />
                        Từ chối
                     </div>
                  ),
               },
            ]}
         />
         <ReportsTab status={TabMap[tab]} />
      </div>
   )
}

type ReportsTabProps = {
   status: FixRequestStatus
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
      <div className="mb-layout grid grid-cols-1 gap-2">
         <div className="text-gray-500">
            {{
               [FixRequestStatus.PENDING]: "Sắp xếp theo ngày tạo (cũ nhất - mới nhất)",
               [FixRequestStatus.APPROVED]: "Sắp xếp theo ngày chỉnh sửa (mới nhất - cũ nhất)",
               [FixRequestStatus.REJECTED]: "Sắp xếp theo ngày chỉnh sửa (mới nhất - cũ nhất)",
            }[props.status] || ""}
         </div>
         {results.isSuccess ? (
            <>
               {results.data.list.length !== 0 ? (
                  results.data.list.map((req, index) => (
                     <ReportCard
                        key={req.id}
                        id={req.id}
                        positionX={req.device.positionX}
                        positionY={req.device.positionY}
                        area={req.device.area.name}
                        machineModelName={req.device?.machineModel?.name ?? "Test Machine"}
                        createdDate={dayjs(req.status === FixRequestStatus.PENDING ? req.createdAt : req.updatedAt)
                           .locale("vi")
                           .format("DD/MM/YY - HH:mm")}
                        onClick={(id: string) => router.push(`/head-staff/mobile/requests/${id}`)}
                        index={index}
                     />
                  ))
               ) : (
                  <Empty description={t("noData")} image={Empty.PRESENTED_IMAGE_SIMPLE} />
               )}
            </>
         ) : (
            <>{results.isLoading && <Card loading />}</>
         )}
      </div>
   )
}
