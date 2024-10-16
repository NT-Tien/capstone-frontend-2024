"use client"

import { Table, DatePicker, Button } from "antd"
import { useQueries } from "@tanstack/react-query"
import Admin_Tasks_Dashboard from "@/features/admin/api/task/dashboard.api"
import { useSearchParams, useRouter } from "next/navigation"
import { PageContainer } from "@ant-design/pro-components"
import { useState } from "react"
import dayjs, { Dayjs } from "dayjs"
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
      width: "170px",
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
            key: "",
         },
         {
            title: "Đã bắt đầu tác vụ",
            dataIndex: "inProgress",
            key: "inProgress",
         },
         {
            title: "Chờ phê duyệt",
            dataIndex: "headDepartmentConfirm",
            key: "headDepartmentConfirm",
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
            headDepartmentConfirm: number
            completed: number
            cancelled: number
         },
      ) => {
         const { awaitingSparePart, inProgress, headDepartmentConfirm, awaitingFixer, assigned, completed, cancelled } =
            record
         return (
            awaitingSparePart + awaitingFixer + inProgress + assigned + headDepartmentConfirm + completed + cancelled
         )
      },
   },
]

function TaskDetails() {
   const searchParams = useSearchParams()
   const areaId = searchParams.get("areaId") ?? ""
   const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs().subtract(3, "months"), dayjs()])
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
               Admin_Tasks_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : dayjs().subtract(3, "months").toISOString(),
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
               Admin_Tasks_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : dayjs().subtract(3, "months").toISOString(),
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
               Admin_Tasks_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : dayjs().subtract(3, "months").toISOString(),
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
               Admin_Tasks_Dashboard({
                  endDate: endDate ? endDate.toISOString() : dayjs().add(1, "day").toISOString(),
                  areaId,
                  startDate: startDate ? startDate.toISOString() : dayjs().subtract(3, "months").toISOString(),
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

   console.log("trả về",api.fixsp.data?.AWAITING_SPARE_SPART);
   

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
         headDepartmentConfirm: api.fixsp.data ? api.fixsp.data.HEAD_DEPARTMENT_CONFIRM : 0,
         "spare-part-fetched": "-",
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
         headDepartmentConfirm: api.fixrplsp.data ? api.fixrplsp.data.HEAD_DEPARTMENT_CONFIRM : 0,
         "spare-part-fetched": "-",
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
         headDepartmentConfirm: api.warranty.data ? api.warranty.data.HEAD_DEPARTMENT_CONFIRM : 0,
         "spare-part-fetched": "-"
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
         headDepartmentConfirm: api.renew.data ? api.renew.data.HEAD_DEPARTMENT_CONFIRM : 0,
         "spare-part-fetched": "-",
      },
   ]

   const totalRow = {
      key: "total",
      category: "Tổng cộng",
      awaitingSparePart: data.reduce((sum, row) => sum + row.awaitingSparePart, 0),
      awaitingFixer: data.reduce((sum, row) => sum + row.awaitingFixer, 0),
      assigned: data.reduce((sum, row) => sum + row.assigned, 0),
      // "spare-part-fetched": data.reduce((sum, row) => sum + row["spare-part-fetched"], 0),
      inProgress: data.reduce((sum, row) => sum + row.inProgress, 0),
      headDepartmentConfirm: data.reduce((sum, row) => sum + row.headDepartmentConfirm, 0),
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
                           headDepartmentConfirm: sum.headDepartmentConfirm + row.headDepartmentConfirm,
                           completed: sum.completed + row.completed,
                           cancelled: sum.cancelled + row.cancelled,
                           assigned: sum.assigned + row.assigned,
                        }),
                        {
                           awaitingSparePart: 0,
                           awaitingFixer: 0,
                           inProgress: 0,
                           headDepartmentConfirm: 0,
                           completed: 0,
                           cancelled: 0,
                           assigned: 0,
                        },
                     )
                     return (
                        <Table.Summary.Row className="font-bold">
                           <Table.Summary.Cell index={0}>Tổng cộng</Table.Summary.Cell>
                           <Table.Summary.Cell index={1}>{totalSumRow.awaitingSparePart}</Table.Summary.Cell>
                           <Table.Summary.Cell index={2}>{totalSumRow.awaitingFixer}</Table.Summary.Cell>
                           <Table.Summary.Cell index={3}>{totalSumRow.assigned}</Table.Summary.Cell>
                           <Table.Summary.Cell index={4}>{"-"}</Table.Summary.Cell>
                           <Table.Summary.Cell index={5}>{totalSumRow.inProgress}</Table.Summary.Cell>
                           <Table.Summary.Cell index={6}>{totalSumRow.headDepartmentConfirm}</Table.Summary.Cell>
                           <Table.Summary.Cell index={7}>{totalSumRow.completed}</Table.Summary.Cell>
                           <Table.Summary.Cell index={8}>{totalSumRow.cancelled}</Table.Summary.Cell>
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
