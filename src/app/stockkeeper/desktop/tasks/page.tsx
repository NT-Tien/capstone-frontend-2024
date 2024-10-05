"use client"

import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { CopyToClipboard } from "@/components/utils/CopyToClipboard"
import { ProTable, TableDropdown } from "@ant-design/pro-components"
import { PageContainer } from "@ant-design/pro-layout"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import Stockkeeper_MachineModel_All from "../../../../features/stockkeeper/api/machine-model/getAll.api"
import { stockkeeper_qk } from "../../../../features/stockkeeper/api/qk"
import { Tag } from "antd"
import Stockkeeper_Task_AllSearch, { type Request } from "../../../../features/stockkeeper/api/task/all-search.api"
import { TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"

const values = {
   nameSingle: "tác vụ",
   nameSingleCapitalized: "Tác vụ",
   namePlural: "tác vụ",
   namePluralCapitalized: "Tác vụ",
   namePluralCapitalizedOptional: "Tác vụ",
   mainQueryFn: Stockkeeper_Task_AllSearch,
   mainQueryKey: stockkeeper_qk.tasks.allSearch,
}

export default function DevicesListPage() {
   const router = useRouter()

   const [query, setQuery] = useState<Request>({
      page: 1,
      limit: 10,
   })

   const api_tasks = useQuery({
      queryKey: values.mainQueryKey(query),
      queryFn: () => values.mainQueryFn(query),
   })

   const api_machineModels = useQuery({
      queryKey: stockkeeper_qk.machineModel.all,
      queryFn: () => Stockkeeper_MachineModel_All({ page: 1, limit: 1000 }),
   })

   const machineModels = useMemo(() => {
      return api_machineModels.data?.list.reduce(
         (acc, item) => {
            acc[item.id] = item.name
            return acc
         },
         {} as Record<string, string>,
      )
   }, [api_machineModels.data?.list])

   const actionRef = useRef()

   if (api_tasks.isError) {
      return api_tasks.error.message
   }

   return (
      <PageContainer
         title={`Danh sách ${values.namePluralCapitalized}`}
         subTitle={`Tổng cộng ${api_tasks.data?.total ?? "..."} ${values.namePluralCapitalizedOptional} trong kho`}
      >
         <ProTable<TaskDto>
            actionRef={actionRef}
            dataSource={api_tasks.data?.list}
            loading={api_tasks.isFetching}
            options={{
               reload: async () => {
                  await api_tasks.refetch()
               },
            }}
            headerTitle="Tác vụ"
            virtual
            form={{
               syncToUrl: (values, type) => {
                  if (type === "get") {
                     return {
                        ...values,
                     }
                  }
                  return values
               },
            }}
            onSubmit={(props: any) => {
               console.log(props)
               setQuery((prev) => ({
                  ...prev,
                  search: {
                     ...props,
                     fixerDate: props.fixerDate ? dayjs(props.fixerDate).add(1, "day").toISOString() : undefined,
                     fixerName: props?.fixer?.username ?? undefined,
                     machineModelId: props?.device?.machineModel?.name ?? undefined,
                  },
               }))
            }}
            onReset={() => {
               router.push("/stockkeeper/desktop/tasks?current=1&pageSize=10")
               setQuery({
                  page: 1,
                  limit: 10,
               })
            }}
            pagination={{
               pageSize: query.limit,
               current: query.page,
               total: api_tasks.data?.total ?? 0,
               showQuickJumper: true,
               showLessItems: true,
               onChange: (page, pageSize) => {
                  setQuery((prev) => ({
                     ...prev,
                     page,
                     limit: pageSize,
                  }))
               },
            }}
            // scroll={{
            //    x: "max-content",
            // }}
            onChange={(page, filters, sorter, extra) => {
               let order, orderBy
               if (Array.isArray(sorter)) {
                  order = sorter[0].order === "descend" ? "DESC" : "ASC"
                  orderBy = sorter[0].field
               } else {
                  order = sorter.order === "descend" ? "DESC" : "ASC"
                  orderBy = sorter.field
               }

               setQuery((prev) => ({
                  ...prev,
                  order: {
                     order: order as any,
                     orderBy: orderBy as any,
                  },
               }))
            }}
            search={{
               layout: "vertical",
               collapseRender: (collapsed) =>
                  collapsed ? (
                     <div className="flex items-center gap-1">
                        Mở
                        <CaretDown />
                     </div>
                  ) : (
                     <div className="flex items-center gap-1">
                        Đóng
                        <CaretUp />
                     </div>
                  ),
               searchText: "Tìm kiếm",
               resetText: "Xóa",
            }}
            columns={[
               {
                  title: "STT",
                  valueType: "indexBorder",
                  align: "center",
                  width: 48,
                  hideInSearch: true,
               },
               {
                  title: "ID",
                  dataIndex: "id",
                  hideInTable: true,
                  valueType: "text",
               },
               {
                  title: "Tên",
                  dataIndex: "name",
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
                  render: (_, record) => (
                     <a
                        onClick={() => {
                           router.push(`/stockkeeper/desktop/tasks/scan?taskid=${record.id}`)
                        }}
                     >
                        {record.name}
                     </a>
                  ),
                  sorter: true,
               },
               {
                  title: "Trạng thái",
                  dataIndex: "status",
                  valueType: "select",
                  valueEnum: TaskStatus,
                  render: (_, record) => (
                     <Tag color={TaskStatusTagMapper[record.status].colorInverse}>
                        {TaskStatusTagMapper[record.status].text}
                     </Tag>
                  ),
                  width: 200,
               },
               {
                  title: "Ưu tiên",
                  dataIndex: "priority",
                  valueType: "select",
                  valueEnum: {
                     true: { text: "Ưu tiên", status: "Success" },
                     false: { text: "Không ưu tiên", status: "Default" },
                  },
                  width: 100,
                  render: (_, record) => <span>{record.priority ? "Ưu tiên" : ""}</span>,
               },
               {
                  title: "Mẫu máy",
                  dataIndex: ["device", "machineModel", "name"],
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "select",
                  valueEnum: machineModels,
                  fieldProps: {
                     showSearch: true,
                  },
               },
               {
                  title: "Thiết bị",
                  dataIndex: ["device", "id"],
                  valueType: "text",
                  width: 200,
                  hideInTable: true,
               },
               {
                  title: "Ngày sửa",
                  dataIndex: "fixerDate",
                  valueType: "date",
                  width: 200,
                  render: (_, record) => (record.fixerDate ? dayjs(record.fixerDate).format("DD/MM/YYYY") : "-"),
               },
               {
                  title: "Đã lấy linh kiện",
                  dataIndex: ["confirmReceipt"],
                  valueType: "switch",
                  width: 100,
                  hideInTable: true,
               },
               {
                  title: "Người sửa",
                  dataIndex: ["fixer", "username"],
                  valueType: "text",
                  width: 200,
                  render: (_, record) => record.fixer?.username ?? "-",
               },
               {
                  title: "Thời gian sửa",
                  dataIndex: "totalTime",
                  valueType: "text",
                  width: 150,
                  render: (_, record) => record.totalTime + " phút" ?? "-",
                  sorter: true,
               },
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  valueType: "date",
                  width: 200,
                  sorter: (a, b) =>
                     dayjs(a.createdAt).add(7, "hours").unix() - dayjs(b.createdAt).add(7, "hours").unix(),
                  hideInSearch: true,
               },
               {
                  title: "Lần trước cập nhật",
                  dataIndex: "updatedAt",
                  valueType: "date",
                  width: 200,
                  sorter: (a, b) =>
                     dayjs(a.updatedAt).add(7, "hours").unix() - dayjs(b.updatedAt).add(7, "hours").unix(),
                  defaultSortOrder: "descend",
                  hideInSearch: true,
               },
               {
                  title: "Tùy chọn",
                  valueType: "option",
                  width: 100,
                  fixed: "right",
                  key: "option",
                  render: (text, record, _, action) => [
                     <TableDropdown
                        key="actionGroup"
                        onSelect={() => action?.reload()}
                        menus={[CopyToClipboard({ value: record.id })]}
                     />,
                  ],
               },
            ]}
         />
      </PageContainer>
   )
}
