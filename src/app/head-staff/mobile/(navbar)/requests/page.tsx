"use client"

import RootHeader from "@/common/components/RootHeader"
import { Card, Empty, Tabs } from "antd"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import HeadStaff_Request_All30Days from "@/app/head-staff/_api/request/all30Days.api"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { useTranslation } from "react-i18next"
import ReportCard from "@/common/components/ReportCard"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { CheckSquareOffset, Hourglass, ThumbsUp, Wrench, XCircle } from "@phosphor-icons/react"
import ScrollableTabs from "@/common/components/ScrollableTabs"

export default function ReportsPage() {
   const { t } = useTranslation()
   const [tab, setTab] = useState<FixRequestStatus>(FixRequestStatus.PENDING)

   return (
      <div className="std-layout">
         <RootHeader title="Yêu cầu" className="std-layout-outer p-4" />
         <ScrollableTabs
            className="std-layout-outer sticky left-0 top-0 z-10"
            classNames={{
               content: "mt-layout",
            }}
            tab={tab}
            onTabChange={setTab}
            items={[
               {
                  key: FixRequestStatus.PENDING,
                  title: "Đang chờ",
                  icon: <Hourglass size={20} />,
               },
               {
                  key: FixRequestStatus.APPROVED,
                  title: "Đã Duyệt",
                  icon: <ThumbsUp size={20} />,
               },
               {
                  key: FixRequestStatus.REJECTED,
                  title: "Từ chối",
                  icon: <XCircle size={20} />,
               },
               {
                  key: FixRequestStatus.IN_PROGRESS,
                  title: "Đang thực hiện",
                  icon: <Wrench size={16} />,
               },
               {
                  key: FixRequestStatus.CLOSED,
                  title: "Đóng",
                  icon: <CheckSquareOffset size={16} />,
               },
            ]}
         />
         <ReportsTab status={tab} />
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
               [FixRequestStatus.IN_PROGRESS]: "Sắp xếp theo ngày chỉnh sửa (mới nhất - cũ nhất)",
               [FixRequestStatus.CLOSED]: "Sắp xếp theo ngày chỉnh sửa (mới nhất - cũ nhất)",
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
                           .add(7, "hours")
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
