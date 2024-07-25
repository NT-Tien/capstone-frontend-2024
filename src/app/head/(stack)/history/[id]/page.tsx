"use client"

import RootHeader from "@/common/components/RootHeader"
import { LeftOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { Card, Steps, Tag } from "antd"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import Head_Request_All from "@/app/head/_api/request/all.api"
import { NotFoundError } from "@/common/error/not-found.error"
import { FixRequestStatus, FixRequestStatusTagMapper } from "@/common/enum/fix-request-status.enum"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { useIssueRequestStatusTranslation } from "@/common/enum/use-issue-request-status-translation"
import DataListView from "@/common/components/DataListView"
import React from "react"
import { MapPin, XCircle } from "@phosphor-icons/react"

const FixRequestStatusIndexMapper: {
   [key in FixRequestStatus as string | "undefined"]: number
} = {
   [FixRequestStatus.PENDING]: 0,
   [FixRequestStatus.APPROVED]: 1,
   [FixRequestStatus.IN_PROGRESS]: 2,
   [FixRequestStatus.CLOSED]: 3,
   [FixRequestStatus.REJECTED]: 1,
   undefined: 0,
}

export default function HistoryDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { getStatusTranslation } = useIssueRequestStatusTranslation()

   const api = useQuery({
      queryKey: qk.issueRequests.allRaw(),
      queryFn: () => Head_Request_All(),
      select: (data) => {
         const issue = data.find((d) => d.id === params.id)
         if (!issue) throw new NotFoundError("Issue")
         return issue
      },
   })

   return (
      <div className="std-layout">
         <RootHeader
            title="Thông tin báo cáo"
            className="std-layout-outer p-4"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            buttonProps={{
               type: "text",
            }}
         />
         <ProDescriptions
            className="mt-layout"
            labelStyle={{
               fontSize: "1rem",
            }}
            contentStyle={{
               fontSize: "1rem",
            }}
            title={<span className="text-lg">{"Cụ thể"}</span>}
            extra={
               <Tag color={FixRequestStatusTagMapper[String(api.data?.status)].color}>
                  {getStatusTranslation(api.data?.status)}
               </Tag>
            }
            dataSource={api.data}
            loading={api.isPending}
            size="small"
            columns={[
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("YYYY-MM-DD HH:mm:ss"),
               },
               {
                  title: "Cập nhật lần cuối",
                  dataIndex: "updatedAt",
                  render: (_, e) =>
                     e.createdAt === e.updatedAt ? "-" : dayjs(e.updatedAt).add(7, "hours").format("YYYY-MM-DD HH:mm:ss"),
               },
               {
                  title: "Báo cáo bởi",
                  dataIndex: ["requester", "username"],
               },
               {
                  title: "Ghi chú",
                  dataIndex: "requester_note",
               },
            ]}
         />
         <section className="mt-3">
            <Card size="small" loading={api.isPending}>
               <Steps
                  size="small"
                  direction="vertical"
                  current={FixRequestStatusIndexMapper[String(api.data?.status)]}
                  status={api.data?.status === FixRequestStatus.REJECTED ? "error" : "process"}
                  className="std-steps"
                  items={[
                     {
                        title: FixRequestStatusTagMapper[FixRequestStatus.PENDING].text,
                        description: "Yêu cầu này đã được tạo và đang chờ xử lý",
                        className: "text-base",
                     },
                     ...(api.isSuccess
                        ? api.data?.status !== FixRequestStatus.REJECTED
                           ? [
                                {
                                   title: FixRequestStatusTagMapper[FixRequestStatus.APPROVED].text,
                                   description: "Yêu cầu đã được phê duyệt",
                                   className: "text-base",
                                },
                                {
                                   title: FixRequestStatusTagMapper[FixRequestStatus.IN_PROGRESS].text,
                                   description: "Yêu cầu đang được xử lý",
                                   className: "text-base",
                                },
                                {
                                   title: FixRequestStatusTagMapper[FixRequestStatus.CLOSED].text,
                                   description: "Yêu cầu đã hoàn thành",
                                   className: "text-base",
                                },
                             ]
                           : [
                                {
                                   title: FixRequestStatusTagMapper[FixRequestStatus.REJECTED].text,
                                   description: "Yêu cầu đã bị từ chối",
                                   className: "text-base",
                                },
                             ]
                        : []),
                  ]}
               />
            </Card>
         </section>
         {api.data?.status === FixRequestStatus.REJECTED && (
            <section className="mt-3 w-full">
               <Card
                  title={
                     <div className="flex items-center gap-1">
                        <XCircle size={18} />
                        Lý do
                     </div>
                  }
                  size="small"
               >
                  {api.data?.checker_note}
               </Card>
            </section>
         )}
         <section className="std-layout-outer mt-6 bg-white py-layout">
            <h2 className="mb-2 px-layout text-lg font-semibold">Chi tiết thiết bị</h2>
            <DataListView
               dataSource={api.data?.device}
               bordered
               itemClassName="py-2"
               labelClassName="font-normal text-neutral-500 text-base"
               valueClassName="text-base"
               items={[
                  {
                     label: "Mẫu máy",
                     value: (s) => s.machineModel?.name,
                  },
                  {
                     label: "Khu vực",
                     value: (s) => s.area?.name,
                  },
                  {
                     label: "Vị trí (x, y)",
                     value: (s) => (
                        <a className="flex items-center gap-1">
                           {s.positionX} x {s.positionY}
                           <MapPin size={16} weight="fill" />
                        </a>
                     ),
                  },
                  {
                     label: "Nhà sản xuất",
                     value: (s) => s.machineModel?.manufacturer,
                  },
                  {
                     label: "Năm sản xuất",
                     value: (s) => s.machineModel?.yearOfProduction,
                  },
                  {
                     label: "Thời hạn bảo hành",
                     value: (s) => s.machineModel?.warrantyTerm,
                  },
                  {
                     label: "Mô tả",
                     value: (s) => s.description,
                  },
               ]}
            />
         </section>
      </div>
   )
}
