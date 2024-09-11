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
import { TaskDto } from "@/common/dto/Task.dto"
import Admin_Tasks_All from "../_api/tasks/all.api"
import { TaskStatus } from "@/common/enum/task-status.enum"

type types = {
   dto: TaskDto
}

const values = {
   nameSingle: "tác vụ",
   nameSingleCapitalized: "Tác vụ",
   mainQueryFn: Admin_Tasks_All,
   mainQueryKey: admin_qk.tasks.all,
   deleteMutationFn: Admin_SpareParts_DeleteSoft,
   restoreMutationFn: Admin_SpareParts_Restore,
   CreateDrawer: CreateSparePartDrawer,
   detailsHref: (page: number, limit: number, status: string, time: number) => `/admin/task/${page}/${limit}/${status}?time=${time}`,
}

export default function RequestListPage() {
   const { message } = App.useApp()
   const [query, setQuery] = useState<Partial<types["dto"]>>({})
   const actionRef = useRef()

   const fetchAllTasks = async () => {
      const statuses = Object.values(TaskStatus);
      const promises = statuses.map(status => 
        Admin_Tasks_All({
          page: 1,
          limit: 10,
          status,
          time: 1,
        })
      );
      const results = await Promise.all(promises);
      const combinedList = results.flatMap(result => result.list);
      const total = results.reduce((sum, result) => sum + result.total, 0);
      return { list: combinedList, total };
    };
  
    const response = useQuery({
      queryKey: ['tasks', { page: 1, limit: 10, time: 1 }],
      queryFn: fetchAllTasks,
    });



    const responseData = useMemo(() => {
      return (
        response.data?.list.filter((data: Partial<TaskDto>) => {
          if (query.area) {
            const areaName = data.device?.area?.name?.toLowerCase() ?? "";
            const searchQuery = query.area.toLowerCase();
            return areaName.includes(searchQuery);
          }
          return true;
        }) ?? []
      );
    }, [response.data, query.area]);
    

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
            onSubmit={(props) => {
               setQuery((prev) => ({
                  ...prev,
                  ...props,
               }));
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
                  width: 48,
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
                  width: 300,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
               },
               {
                  title: "Khu vực",
                  key: "area",
                  render: (_, record) => record.device.area.name,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
               },
               {
                  title: "Trạng thái",
                  dataIndex: "status",
                  width: 200,
                  valueType: "text",
               },
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.createdAt).add(7, "hours").unix() - dayjs(b.createdAt).add(7, "hours").unix(),
               },
               {
                  title: "Ngày cập nhật",
                  dataIndex: "updatedAt",
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.updatedAt).add(7, "hours").unix() - dayjs(b.updatedAt).add(7, "hours").unix(),
                  defaultSortOrder: "descend",
               },
               {
                  title: "Tổng thời gian",
                  key: "taskName",
                  render: (_, record) => record.totalTime,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "number",
               },
               {
                  title: "Nhân viên",
                  key: "taskName",
                  render: (_, record) => record.fixer?.username,
                  ellipsis: {
                     showTitle: true,
                  },
                  width: 100,
                  valueType: "text",
               },
            ]}
         />
      </PageContainer>
   )
}