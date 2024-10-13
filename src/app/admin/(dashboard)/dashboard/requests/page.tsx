"use client"

import { Table, DatePicker } from "antd"
import { useQueries } from "@tanstack/react-query"
import Admin_Requests_Dashboard from "@/features/admin/api/request/dashboard.api"
import { useSearchParams } from "next/navigation"
import { PageContainer } from "@ant-design/pro-components"
import { useState } from "react"
import dayjs, { Dayjs } from "dayjs"

const { RangePicker } = DatePicker;

const areaNameMapping: Record<string, string> = {
   "13734c3c-5f3b-472e-805f-557c1f08eeb2": "Q1",
   "4727b5ec-87a9-4aec-9aef-c56f06258426": "Q2",
   "6b2e4394-239d-437e-b5a5-62be14dea23e": "Q3",
   "7be024ff-39bb-4ae1-b9a0-996a71e2e966": "Q4",
   "3d78678d-1f25-4df7-8a84-6640a7692456": "Q5",
};

const columns = [
   {
      title: "Phân Loại",
      dataIndex: "category",
      key: "category",
      width: "150px",
   },
   {
      title: "Chờ",
      children: [
         {
            title: "Chưa xem",
            dataIndex: "notSeen",
            key: "notSeen",
         },
         {
            title: "Đã Xem",
            dataIndex: "hasSeen",
            key: "hasSeen",
         },
         {
            title: "Xác nhận",
            dataIndex: "approved",
            key: "approved",
         },
      ],
   },
   {
      title: "Đang xử lí",
      children: [
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
]

function RequestDetails() {
   const searchParams = useSearchParams()
   const areaId = searchParams.get("areaId") ?? ""
   const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
   const [startDate, endDate] = dateRange || [null, null];
   const areaName = areaNameMapping[areaId] || "Unknown Area";
   const api = useQueries({
      queries: [
         {
            queryKey: ["admin", "requests", "dashboard", "fix", areaId, startDate?.toISOString(), endDate?.toISOString()],
            queryFn: () =>
               Admin_Requests_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : "2024-09-07T02:24:40.298Z",
                  type: "fix",
               }),
            enabled: !!areaId,
         },
         {
            queryKey: ["admin", "requests", "dashboard", "renew", areaId, startDate?.toISOString(), endDate?.toISOString()],
            queryFn: () =>
               Admin_Requests_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : "2024-09-07T02:24:40.298Z",
                  type: "renew",
               }),
            enabled: !!areaId,
         },
         {
            queryKey: ["admin", "requests", "dashboard", "warranty", areaId, startDate?.toISOString(), endDate?.toISOString()],
            queryFn: () =>
               Admin_Requests_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : "2024-09-07T02:24:40.298Z",
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


   return (
      <div className="mt-5">
         <PageContainer title={`Thông tin chi tiết yêu cầu của khu vực ${areaName}`} >
            <div>
            <RangePicker 
               onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
               value={dateRange} 
               style={{ marginBottom: '1rem' }}
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
               <Table columns={columns} dataSource={data} bordered pagination={false} scroll={{ x: "max-content" }} />
            </div>
         </PageContainer>
      </div>
   )
}
export default RequestDetails
