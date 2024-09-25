"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProTable } from "@ant-design/pro-components"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import { App } from "antd"
import Admin_SpareParts_DeleteSoft from "@/app/admin/_api/spare-parts/delete-soft.api"
import Admin_SpareParts_Restore from "@/app/admin/_api/spare-parts/restore.api"
import CreateSparePartDrawer from "@/app/admin/spare-parts/_components/create-spare-part.drawer"
import { admin_qk } from "../_api/qk"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import Admin_Tasks_All from "../_api/tasks/all.api"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"

type QueryState = {
   area?: string
   status?: TaskStatus
   createdAt?: string
   fixer?: string
}

const values = {
   nameSingle: "tác vụ",
   nameSingleCapitalized: "Tác vụ",
   mainQueryFn: Admin_Tasks_All,
   mainQueryKey: admin_qk.tasks.all,
   deleteMutationFn: Admin_SpareParts_DeleteSoft,
   restoreMutationFn: Admin_SpareParts_Restore,
   CreateDrawer: CreateSparePartDrawer,
   detailsHref: (page: number, limit: number, status: string, time: number) =>
      `/admin/task/${page}/${limit}/${status}?time=${time}`,
}

export default function RequestListPage() {
   const actionRef = useRef()
   const [query, setQuery] = useState<QueryState>({})

   const response = useQuery({
      queryKey: ["tasks", { page: 1, limit: 10, time: 1 }],
      queryFn: () =>
         Admin_Tasks_All({
            page: 1,
            limit: 10,
            status: TaskStatus.ASSIGNED,
            time: 1,
         }),
   })

   const responseData = useMemo(() => {
      if (!response.data) return []

      return response.data.filter((item) => {
         const matchStatus = query.status ? item.status.toLocaleLowerCase() === query.status : true
         const matchCreatedAt = query.createdAt ? dayjs(item.createdAt).isSame(query.createdAt, "day") : true
         // const matchFixer = query.fixer ? item.fixer.username.toLowerCase().includes(query.fixer.toLocaleLowerCase()) : true;
         return (
            matchStatus && matchCreatedAt
            //  matchFixer
         )
      })
   }, [response.data, query])

   if (response.isError) {
      return response.error.message
   }

   return (
      <PageContainer
         title={`Danh sách ${values.nameSingle}`}
         subTitle={`Tổng cộng ${responseData?.length ?? "..."} ${values.nameSingle} đã được tìm thấy.`}
         loading={response.isLoading}
      >
         <ProTable
            actionRef={actionRef}
            dataSource={responseData ?? []}
            loading={response.isFetching}
            options={{
               reload: async () => {
                  await response.refetch()
               },
            }}
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
            onSubmit={(values) => {
               setQuery({
                  ...values,
                  //   fixer: values.fixer || '',
               })
            }}
            onReset={() => {
               setQuery({})
            }}
            pagination={{
               pageSize: 10,
               showQuickJumper: true,
               showLessItems: true,
            }}
            columns={[
               {
                  title: "STT",
                  valueType: "indexBorder",
                  width: 40,
                  hideInSearch: true,
               },
               {
                  title: "ID",
                  dataIndex: "id",
                  hideInTable: true,
                  valueType: "text",
                  hideInSearch: true,
               },
               {
                  title: "Tên tác vụ",
                  key: "taskName",
                  render: (_, record) => record.name,
                  width: 150,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
                  hideInSearch: true,
               },
               {
                  title: "Trạng thái",
                  dataIndex: "status",
                  width: 60,
                  valueType: "text",
               },
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  valueType: "date",
                  sorter: (a, b) =>
                     dayjs(a.createdAt).add(7, "hours").unix() - dayjs(b.createdAt).add(7, "hours").unix(),
                  width: 100,
               },
               {
                  title: "Ngày cập nhật",
                  dataIndex: "updatedAt",
                  valueType: "date",
                  sorter: (a, b) =>
                     dayjs(a.updatedAt).add(7, "hours").unix() - dayjs(b.updatedAt).add(7, "hours").unix(),
                  defaultSortOrder: "descend",
                  width: 100,
                  hideInSearch: true,
               },
               {
                  title: "Tổng thời gian",
                  key: "totalTime",
                  render: (_, record) => record.totalTime,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "number",
                  width: 80,
                  hideInSearch: true,
               },
               // {
               //    title: "Nhân viên",
               //    key: "fixer",
               //    render: (_, record) => record.fixer?.username,
               //    ellipsis: {
               //       showTitle: true,
               //    },
               //    width: 60,
               //    valueType: "text",
               // },
            ]}
         />
      </PageContainer>
   )
}
