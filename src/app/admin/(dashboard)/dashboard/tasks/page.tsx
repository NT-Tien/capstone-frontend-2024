"use client"

import { Table, DatePicker, Button } from "antd"
import { useQueries } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { PageContainer } from "@ant-design/pro-components"
import { useState } from "react"
import dayjs, { Dayjs } from "dayjs"
import { ArrowLeftOutlined } from "@ant-design/icons"
import Admin_Task_Dashboard from "@/features/admin/api/task/dashboard.api"

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
      width: "170px",
      fixed: true,
   },
   {
      title: "Chờ",
      children: [
         {
            title: "Thiếu linh kiện",
            dataIndex: "awaitingSparePart",
            key: "awaitingSparePart",
         },
         {
            title: "Chưa phân công",
            dataIndex: "awaitingFixer",
            key: "awaitingFixer",
         },
      ],
   },
   {
      title: "Đang xử lí bởi nhân viên",
      children: [
         {
            title: "Đã phân công",
            dataIndex: "assigned",
            key: "assigned",
         },
         {
            title: "Đã lấy linh kiện/máy",
            dataIndex: "spare-part-fetched",
            key: "spare-part-fetched",
         },
         {
            title: "Đã bắt đầu tác vụ",
            dataIndex: "inProgress",
            key: "inProgress",
         },
         {
            title: "Chờ phê duyệt",
            dataIndex: "headStaffConfirm",
            key: "headStaffConfirm",
         },
      ],
   },
   {
      title: "Đã đóng",
      children: [
         {
            title: "Hoàn tất",
            dataIndex: "completed",
            key: "completed",
         },
         {
            title: "Thất bại",
            dataIndex: "cancelled",
            key: "cancelled",
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
            awaitingSparePart: number
            awaitingFixer: number
            assigned: number
            inProgress: number
            headStaffConfirm: number
            completed: number
            cancelled: number
            "spare-part-fetched": number
         },
      ) => {
         const { awaitingSparePart, inProgress, headStaffConfirm, awaitingFixer, assigned, completed, cancelled } =
            record
         const sparePartFetched = record["spare-part-fetched"] || 0
         return (
            awaitingSparePart +
            awaitingFixer +
            inProgress +
            assigned +
            headStaffConfirm +
            completed +
            cancelled +
            sparePartFetched
         )
      },
   },
]

function TaskDetails() {
   const searchParams = useSearchParams()
   const areaId = searchParams.get("areaId") ?? ""
   const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs().subtract(1, "week"), dayjs()])
   const [startDate, endDate] = dateRange || [null, null]
   const router = useRouter()
   const areaName = areaNameMapping[areaId] || "Unknown Area"
   const api = useQueries({
      queries: [
         {
            queryKey: [
               "admin",
               "task",
               "dashboard",
               "fix-sp",
               areaId,
               startDate?.toISOString(),
               endDate?.toISOString(),
            ],
            queryFn: () =>
               Admin_Task_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : dayjs().subtract(1, "week").toISOString(),
                  type: "fix-sp",
               }),
            enabled: !!areaId,
         },
         {
            queryKey: [
               "admin",
               "task",
               "dashboard",
               "fix-rpl-sp",
               areaId,
               startDate?.toISOString(),
               endDate?.toISOString(),
            ],
            queryFn: () =>
               Admin_Task_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : dayjs().subtract(1, "week").toISOString(),
                  type: "fix-rpl-sp",
               }),
            enabled: !!areaId,
         },
         {
            queryKey: [
               "admin",
               "task",
               "dashboard",
               "renew",
               areaId,
               startDate?.toISOString(),
               endDate?.toISOString(),
            ],
            queryFn: () =>
               Admin_Task_Dashboard({
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
               "task",
               "dashboard",
               "warranty",
               areaId,
               startDate?.toISOString(),
               endDate?.toISOString(),
            ],
            queryFn: () =>
               Admin_Task_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : dayjs().subtract(1, "week").toISOString(),
                  type: "warranty",
               }),
            enabled: !!areaId,
         },
      ],
      combine: (data) => ({
         fixsp: data[0],
         fixrplsp: data[1],
         renew: data[2],
         warranty: data[3],
      }),
   })

   const data = [
      {
         key: "1",
         category: "Sửa chữa",
         awaitingSparePart: api.fixsp.data ? api.fixsp.data.AWAITING_SPARE_SPART : 0,
         awaitingFixer: api.fixsp.data ? api.fixsp.data.AWAITING_FIXER : 0,
         cancelled: api.fixsp.data ? api.fixsp.data.CANCELLED : 0,
         assigned: api.fixsp.data ? api.fixsp.data.ASSIGNED : 0,
         inProgress: api.fixsp.data ? api.fixsp.data.IN_PROGRESS : 0,
         completed: api.fixsp.data ? api.fixsp.data.COMPLETED : 0,
         headStaffConfirm: api.fixsp.data ? api.fixsp.data.HEAD_STAFF_CONFIRM : 0,
         "spare-part-fetched": api.fixsp.data ? api.fixsp.data["spare-part-fetched"] : 0,
         // headCancel: api.fixsp.data ? api.fixsp.data.HEAD_CANCEL : 0,
      },
      {
         key: "2",
         category: "Thay thế",
         awaitingSparePart: api.fixrplsp.data ? api.fixrplsp.data.AWAITING_SPARE_SPART : 0,
         awaitingFixer: api.fixrplsp.data ? api.fixrplsp.data.AWAITING_FIXER : 0,
         cancelled: api.fixrplsp.data ? api.fixrplsp.data.CANCELLED : 0,
         assigned: api.fixrplsp.data ? api.fixrplsp.data.ASSIGNED : 0,
         inProgress: api.fixrplsp.data ? api.fixrplsp.data.IN_PROGRESS : 0,
         completed: api.fixrplsp.data ? api.fixrplsp.data.COMPLETED : 0,
         headStaffConfirm: api.fixrplsp.data ? api.fixrplsp.data.HEAD_STAFF_CONFIRM : 0,
         "spare-part-fetched": api.fixrplsp.data ? api.fixrplsp.data["spare-part-fetched"] : 0,
      },

      {
         key: "3",
         category: "Bảo hành",
         awaitingSparePart: api.warranty.data ? api.warranty.data.AWAITING_SPARE_SPART : 0,
         awaitingFixer: api.warranty.data ? api.warranty.data.AWAITING_FIXER : 0,
         cancelled: api.warranty.data ? api.warranty.data.CANCELLED : 0,
         assigned: api.warranty.data ? api.warranty.data.ASSIGNED : 0,
         inProgress: api.warranty.data ? api.warranty.data.IN_PROGRESS : 0,
         completed: api.warranty.data ? api.warranty.data.COMPLETED : 0,
         headStaffConfirm: api.warranty.data ? api.warranty.data.HEAD_STAFF_CONFIRM : 0,
         "spare-part-fetched": api.warranty.data ? api.warranty.data["spare-part-fetched"] : 0,
      },
      {
         key: "4",
         category: "Thay máy mới",
         awaitingSparePart: api.renew.data ? api.renew.data.AWAITING_SPARE_SPART : 0,
         awaitingFixer: api.renew.data ? api.renew.data.AWAITING_FIXER : 0,
         cancelled: api.renew.data ? api.renew.data.CANCELLED : 0,
         assigned: api.renew.data ? api.renew.data.ASSIGNED : 0,
         inProgress: api.renew.data ? api.renew.data.IN_PROGRESS : 0,
         completed: api.renew.data ? api.renew.data.COMPLETED : 0,
         headStaffConfirm: api.renew.data ? api.renew.data.HEAD_STAFF_CONFIRM : 0,
         "spare-part-fetched": api.renew.data ? api.renew.data["spare-part-fetched"] : 0,
      },
   ]

   const totalRow = {
      key: "total",
      category: "Tổng cộng",
      awaitingSparePart: data.reduce((sum, row) => sum + row.awaitingSparePart, 0),
      awaitingFixer: data.reduce((sum, row) => sum + row.awaitingFixer, 0),
      assigned: data.reduce((sum, row) => sum + row.assigned, 0),
      "spare-part-fetched": data.reduce((sum, row) => sum + row["spare-part-fetched"], 0),
      inProgress: data.reduce((sum, row) => sum + row.inProgress, 0),
      headStaffConfirm: data.reduce((sum, row) => sum + row.headStaffConfirm, 0),
      completed: data.reduce((sum, row) => sum + row.completed, 0),
      cancelled: data.reduce((sum, row) => sum + row.cancelled, 0),
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
         <PageContainer title={`Thông tin chi tiết tác vụ của khu vực ${areaName}`}>
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
                  dataSource={data}
                  columns={columns}
                  bordered
                  pagination={false}
                  scroll={{ x: "max-content" }}
                  summary={(pageData) => {
                     const totalSumRow = pageData.reduce(
                        (sum, row) => ({
                           awaitingSparePart: sum.awaitingSparePart + row.awaitingSparePart,
                           awaitingFixer: sum.awaitingFixer + row.awaitingFixer,
                           inProgress: sum.inProgress + row.inProgress,
                           headStaffConfirm: sum.headStaffConfirm + row.headStaffConfirm,
                           completed: sum.completed + row.completed,
                           cancelled: sum.cancelled + row.cancelled,
                           assigned: sum.assigned + row.assigned,
                           "spare-part-fetched": sum["spare-part-fetched"] + row["spare-part-fetched"],
                        }),
                        {
                           awaitingSparePart: 0,
                           awaitingFixer: 0,
                           inProgress: 0,
                           headStaffConfirm: 0,
                           "spare-part-fetched": 0,
                           completed: 0,
                           cancelled: 0,
                           assigned: 0,
                        },
                     )
                     const grandTotal =
                        totalSumRow.awaitingSparePart +
                        totalSumRow.awaitingFixer +
                        totalSumRow.assigned +
                        totalSumRow.inProgress +
                        totalSumRow.headStaffConfirm +
                        totalSumRow.completed +
                        totalSumRow.cancelled +
                        totalSumRow["spare-part-fetched"]
                     return (
                        <Table.Summary.Row className="font-bold">
                           <Table.Summary.Cell index={0}>Tổng cộng</Table.Summary.Cell>
                           <Table.Summary.Cell index={1}>{totalSumRow.awaitingSparePart}</Table.Summary.Cell>
                           <Table.Summary.Cell index={2}>{totalSumRow.awaitingFixer}</Table.Summary.Cell>
                           <Table.Summary.Cell index={3}>{totalSumRow.assigned}</Table.Summary.Cell>
                           <Table.Summary.Cell index={4}>{totalSumRow["spare-part-fetched"]}</Table.Summary.Cell>
                           <Table.Summary.Cell index={5}>{totalSumRow.inProgress}</Table.Summary.Cell>
                           <Table.Summary.Cell index={6}>{totalSumRow.headStaffConfirm}</Table.Summary.Cell>
                           <Table.Summary.Cell index={7}>{totalSumRow.completed}</Table.Summary.Cell>
                           <Table.Summary.Cell index={8}>{totalSumRow.cancelled}</Table.Summary.Cell>
                           <Table.Summary.Cell index={9} className="text-red-500">
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

export default TaskDetails
