"use client"

import { Table, DatePicker, Card, Button } from "antd"
import { useQueries } from "@tanstack/react-query"
import Admin_Requests_Dashboard from "@/features/admin/api/request/dashboard.api"
import { useRouter, useSearchParams } from "next/navigation"
import { PageContainer } from "@ant-design/pro-components"
import { useState } from "react"
import dayjs, { Dayjs } from "dayjs"
import CountUp from "react-countup"
import { ChartLineUp } from "@phosphor-icons/react"
import { ArrowLeftOutlined } from "@ant-design/icons"

const { RangePicker } = DatePicker

const areaNameMapping: Record<string, string> = {
   "13734c3c-5f3b-472e-805f-557c1f08eeb2": "Q1",
   "4727b5ec-87a9-4aec-9aef-c56f06258426": "Q2",
   "6b2e4394-239d-437e-b5a5-62be14dea23e": "Q3",
   "7be024ff-39bb-4ae1-b9a0-996a71e2e966": "Q4",
   "3d78678d-1f25-4df7-8a84-6640a7692456": "Q5",
}

const columns = [
   {
      title: "Phân Loại",
      dataIndex: "category",
      key: "category",
      width: "150px",
      fixed: true,
   },
   // {
   //    title: "Chờ",
   //    dataIndex: "pending",
   //    key: "pending",
   // },
   {
      title: "Đang xử lí",
      children: [
         {
            title: "Xác nhận",
            dataIndex: "approved",
            key: "approved",
         },
         {
            title: "Đang thực hiện",
            dataIndex: "inProgress",
            key: "inProgress",
         },
         {
            title: "Chờ đánh giá",
            dataIndex: "headConfirm",
            key: "headConfirm",
         },
      ],
   },
   {
      title: "Đã đóng",
      children: [
         {
            title: "Hoàn tất",
            dataIndex: "closed",
            key: "closed",
         },
         {
            title: "Tổ trưởng sản xuất",
            dataIndex: "headCancel",
            key: "headCancel",
         },
         {
            title: "Tổ trưởng bảo trì",
            dataIndex: "rejected",
            key: "rejected",
         },
      ],
   },
   {
      title: "Tổng cộng",
      key: "rowTotal",
      className: "font-bold",
      render: (
         text: string,
         record: {
            approved: number
            inProgress: number
            headConfirm: number
            closed: number
            headCancel: number
            rejected: number
         },
      ) => {
         const { approved, inProgress, headConfirm, closed, headCancel, rejected } = record
         return approved + inProgress + headConfirm + closed + headCancel + rejected
      },
   },
]

function RequestDetails() {
   const searchParams = useSearchParams()
   const areaId = searchParams.get("areaId") ?? ""
   const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
      dayjs().subtract(1, "week"),
      dayjs().add(1, "day"),
   ])
   const [startDate, endDate] = dateRange || [null, null]
   const router = useRouter()
   const areaName = areaNameMapping[areaId] || "Unknown Area"
   const api = useQueries({
      queries: [
         {
            queryKey: [
               "admin",
               "requests",
               "dashboard",
               "fix",
               areaId,
               startDate?.toISOString(),
               endDate?.toISOString(),
            ],
            queryFn: () =>
               Admin_Requests_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : dayjs().subtract(1, "week").toISOString(),
                  type: "fix",
               }),
            enabled: !!areaId,
         },
         {
            queryKey: [
               "admin",
               "requests",
               "dashboard",
               "renew",
               areaId,
               startDate?.toISOString(),
               endDate?.toISOString(),
            ],
            queryFn: () =>
               Admin_Requests_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : dayjs().subtract(1, "week").toISOString(),
                  type: "renew",
               }),
            enabled: !!areaId,
         },
         {
            queryKey: [
               "admin",
               "requests",
               "dashboard",
               "warranty",
               areaId,
               startDate?.toISOString(),
               endDate?.toISOString(),
            ],
            queryFn: () =>
               Admin_Requests_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : dayjs().subtract(1, "week").toISOString(),
                  type: "warranty",
               }),
            enabled: !!areaId,
         },
      ],
      combine: (data) => ({
         fix: data[0],
         renew: data[1],
         warranty: data[2],
      }),
   })

   const data = [
      {
         key: "1",
         category: "Sửa chữa",
         notSeen: api.fix.data ? api.fix.data.not_seen : 0,
         hasSeen: api.fix.data ? api.fix.data.has_seen : 0,
         approved: api.fix.data ? api.fix.data.APPROVED : 0,
         inProgress: api.fix.data ? api.fix.data.IN_PROGRESS : 0,
         headConfirm: api.fix.data ? api.fix.data.HEAD_CONFIRM : 0,
         closed: api.fix.data ? api.fix.data.CLOSED : 0,
         rejected: api.fix.data ? api.fix.data.REJECTED : 0,
         headCancel: api.fix.data ? api.fix.data.HEAD_CANCEL : 0,
      },
      {
         key: "2",
         category: "Bảo trì",
         notSeen: api.warranty.data ? api.warranty.data?.not_seen : 0,
         hasSeen: api.warranty.data ? api.warranty.data?.has_seen : 0,
         approved: api.warranty.data ? api.warranty.data.APPROVED : 0,
         inProgress: api.warranty.data ? api.warranty.data.IN_PROGRESS : 0,
         headConfirm: api.warranty.data ? api.warranty.data.HEAD_CONFIRM : 0,
         closed: api.warranty.data ? api.warranty.data.CLOSED : 0,
         rejected: api.warranty.data ? api.warranty.data.REJECTED : 0,
         headCancel: api.warranty.data ? api.warranty.data.HEAD_CANCEL : 0,
      },
      {
         key: "3",
         category: "Thay máy mới",
         notSeen: api.renew.data ? api.renew.data?.not_seen : 0,
         hasSeen: api.renew.data ? api.renew.data?.has_seen : 0,
         approved: api.renew.data ? api.renew.data.APPROVED : 0,
         inProgress: api.renew.data ? api.renew.data.IN_PROGRESS : 0,
         headConfirm: api.renew.data ? api.renew.data.HEAD_CONFIRM : 0,
         closed: api.renew.data ? api.renew.data.CLOSED : 0,
         rejected: api.renew.data ? api.renew.data.REJECTED : 0,
         headCancel: api.renew.data ? api.renew.data.HEAD_CANCEL : 0,
      },
   ]

   const totalSumRow = {
      key: "total",
      category: "Tổng cộng",
      approved: data.reduce((sum, record) => sum + record.approved, 0),
      inProgress: data.reduce((sum, record) => sum + record.inProgress, 0),
      headConfirm: data.reduce((sum, record) => sum + record.headConfirm, 0),
      closed: data.reduce((sum, record) => sum + record.closed, 0),
      rejected: data.reduce((sum, record) => sum + record.rejected, 0),
      headCancel: data.reduce((sum, record) => sum + record.headCancel, 0),
   }

   return (
      <div className="mt-5">
         <Button
            className="ml-10"
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/admin")}
            style={{ marginBottom: "1rem" }}
         >
            Quay lại
         </Button>
         <PageContainer title={`Thông tin chi tiết yêu cầu của khu vực ${areaName}`}>
            <div>
               <RangePicker
                  onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
                  value={dateRange}
                  style={{ marginBottom: "1rem" }}
               />
            </div>
            <div
               style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  marginTop: "2rem",
               }}
            >
               <Table
                  columns={columns}
                  dataSource={data}
                  bordered
                  pagination={false}
                  scroll={{ x: "max-content" }}
                  summary={(pageData) => {
                     const totalSumRow = pageData.reduce(
                        (sum, row) => ({
                           approved: sum.approved + row.approved,
                           inProgress: sum.inProgress + row.inProgress,
                           headConfirm: sum.headConfirm + row.headConfirm,
                           closed: sum.closed + row.closed,
                           headCancel: sum.headCancel + row.headCancel,
                           rejected: sum.rejected + row.rejected,
                        }),
                        {
                           approved: 0,
                           inProgress: 0,
                           headConfirm: 0,
                           closed: 0,
                           headCancel: 0,
                           rejected: 0,
                        },
                     )

                     const grandTotal =
                        totalSumRow.approved +
                        totalSumRow.closed +
                        totalSumRow.headCancel +
                        totalSumRow.headConfirm +
                        totalSumRow.inProgress +
                        totalSumRow.rejected
                     return (
                        <Table.Summary.Row className="font-bold">
                           <Table.Summary.Cell index={0}>Tổng cộng</Table.Summary.Cell>
                           <Table.Summary.Cell index={1}>{totalSumRow.approved}</Table.Summary.Cell>
                           <Table.Summary.Cell index={2}>{totalSumRow.inProgress}</Table.Summary.Cell>
                           <Table.Summary.Cell index={3}>{totalSumRow.headConfirm}</Table.Summary.Cell>
                           <Table.Summary.Cell index={4}>{totalSumRow.closed}</Table.Summary.Cell>
                           <Table.Summary.Cell index={5}>{totalSumRow.headCancel}</Table.Summary.Cell>
                           <Table.Summary.Cell index={6}>{totalSumRow.rejected}</Table.Summary.Cell>
                           <Table.Summary.Cell className="text-red-500" index={7}>
                              {grandTotal}
                           </Table.Summary.Cell>
                        </Table.Summary.Row>
                     )
                  }}
               />
            </div>
         </PageContainer>
      </div>
   )
}

export default RequestDetails
