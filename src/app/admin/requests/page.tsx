"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProTable, TableDropdown } from "@ant-design/pro-components"
import { useMutation, useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import { App, Button } from "antd"
import { CopyToClipboard } from "@/common/util/copyToClipboard.util"
import { DeleteOutlined, RollbackOutlined } from "@ant-design/icons"
import Link from "next/link"
import Admin_SpareParts_DeleteSoft from "@/app/admin/_api/spare-parts/delete-soft.api"
import Admin_SpareParts_Restore from "@/app/admin/_api/spare-parts/restore.api"
import CreateSparePartDrawer from "@/app/admin/spare-parts/_components/create-spare-part.drawer"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import Admin_SpareParts_All from "@/app/admin/_api/spare-parts/all.api"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import Admin_Requests_All from "../_api/requests/all.api"
import { admin_qk } from "../_api/qk"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"

type types = {
   dto: FixRequestDto
}

const values = {
   nameSingle: "yêu cầu",
   nameSingleCapitalized: "Yêu cầu",
   // namePlural: "requests",
   // namePluralCapitalized: "Requests",
   // namePluralCapitalizedOptional: "Request(s)",
   mainQueryFn: Admin_Requests_All,
   mainQueryKey: admin_qk.requests.all,
   deleteMutationFn: Admin_SpareParts_DeleteSoft,
   restoreMutationFn: Admin_SpareParts_Restore,
   CreateDrawer: CreateSparePartDrawer,
   detailsHref: (page: number, limit: number, status: string, time: number) => `/admin/request/${page}/${limit}/${status}?time=${time}`,
}

export default function RequestListPage() {
   const { message } = App.useApp()
   const [query, setQuery] = useState<Partial<types["dto"]>>({})
   const actionRef = useRef()

   const fetchAllRequests = async () => {
      const statuses = Object.values(FixRequestStatus);
      const promises = statuses.map(status => 
        Admin_Requests_All({
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
      queryKey: ['requests', { page: 1, limit: 10, time: 1 }],
      queryFn: fetchAllRequests,
    });

   const mutate_delete = useMutation({
      mutationFn: values.deleteMutationFn,
      onMutate: async () => {
         message.open({
            type: "loading",
            content: `Deleting ${values.nameSingleCapitalized}...`,
            key: `delete-${values.nameSingle}`,
         })
      },
      onError: async (error) => {
         message.error({
            content: `Failed to delete ${values.nameSingleCapitalized}. See logs.`,
         })
      },
      onSuccess: async () => {
         message.success({
            content: `${values.nameSingleCapitalized} deleted successfully.`,
         })
         await response.refetch()
      },
      onSettled: () => {
         message.destroy(`delete-${values.nameSingle}`)
      },
   })

   const mutate_restore = useMutation({
      mutationFn: values.restoreMutationFn,
      onMutate: async () => {
         message.open({
            type: "loading",
            content: `Restoring ${values.nameSingleCapitalized}...`,
            key: `restore-${values.nameSingle}`,
         })
      },
      onError: async (error) => {
         message.error({
            content: `Failed to restore ${values.nameSingleCapitalized}. See logs.`,
         })
      },
      onSuccess: async () => {
         message.success({
            content: `${values.nameSingleCapitalized} restored successfully.`,
         })
         await response.refetch()
      },
      onSettled: () => {
         message.destroy(`restore-${values.nameSingle}`)
      },
   })

   const responseData = useMemo(() => {
      return (
         response.data?.list.filter((data) => {
            let result = false
            const queryEntries = Object.entries(query)
            if (queryEntries.length === 0) return true
            for (const [key, value] of queryEntries) {
               switch (key) {
                  case "id":
                     result = result || data.id.includes(value as string)
                     break
                  // case "name":
                  //    result = result || data.device..includes(value as string)
                  //    break
                  // case "quantity":
                  //    result = result || Number(data.) === Number(value)
                  //    break
                  // case "machineModel":
                  //    result = result || data.machineModel.name.includes(value as string)
                  //    break
                  // case "expirationDate":
                  //    result = result || dayjs(data.expirationDate).add(7, "hours").isSame(value as string, "day")
                  //    break
                  case "createdAt":
                     result = result || dayjs(data.createdAt).add(7, "hours").isSame(value as string, "day")
                     break
                  case "updatedAt":
                     result = result || dayjs(data.updatedAt).add(7, "hours").isSame(value as string, "day")
                     break
                  case "deletedAt":
                     result =
                        result || value === null
                           ? data.deletedAt === null
                           : dayjs(data.deletedAt).add(7, "hours").isSame(dayjs(value as string), "day")
               }
            }
            return result
         }) ?? []
      )
   }, [response.data, query])

   if (response.isError) {
      return response.error.message
   }

   return (
      <PageContainer
         title={`Danh sách ${values.nameSingle}`}
         subTitle={`Tổng cộng ${responseData?.length ?? "..."} ${values.nameSingle} đã được tìm thấy.`}
         loading={response.isLoading}
         // extra={
         //    <values.CreateDrawer>
         //       {(handleOpen) => (
         //          <Button key="create-position-btn" type="primary" onClick={handleOpen}>
         //             Create
         //          </Button>
         //       )}
         //    </values.CreateDrawer>
         // }
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
               setQuery(props)
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
               },
               // {
               //    title: "Name",
               //    dataIndex: "name",
               //    width: 200,
               //    ellipsis: {
               //       showTitle: true,
               //    },
               //    valueType: "text",
               // },
               {
                  title: "Tên thiết bị",
                  key: "machineModel",
                  render: (_, record) => record.device.machineModel.name,
                  width: 300,
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
               // {
               //    title: "Expiration Date",
               //    dataIndex: "expirationDate",
               //    valueType: "date",
               //    sorter: (a, b) => dayjs(a.).add(7, "hours").unix() - dayjs(b.expirationDate).add(7, "hours").unix(),
               // },
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
                  title: "Người báo cáo",
                  key: "machineModel",
                  render: (_, record) => record.requester?.username,
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
               },
               {
                  title: "Ghi chú",
                  key: "machineModel",
                  render: (_, record) => record.requester_note,
                  width: 300,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
               },
               // {
               //    title: "Options",
               //    valueType: "option",
               //    width: 100,
               //    key: "option",
               //    render: (text, record, _, action) => [
               //       <Link key={"View"} href={values.detailsHref(record.)}>
               //          View
               //       </Link>,
               //       <TableDropdown
               //          key="actionGroup"
               //          onSelect={() => action?.reload()}
               //          menus={[
               //             CopyToClipboard({ value: record.id }),
               //             {
               //                key: record.deletedAt ? "restore" : "delete",
               //                icon: record.deletedAt ? <RollbackOutlined /> : <DeleteOutlined />,
               //                name: record.deletedAt ? "Restore" : "Delete",
               //                danger: true,
               //                onClick: async () => {
               //                   record.deletedAt
               //                      ? await mutate_restore.mutateAsync({ id: record.id })
               //                      : await mutate_delete.mutateAsync({ id: record.id })
               //                },
               //             },
               //          ]}
               //       />,
               //    ],
               // },
            ]}
         />
      </PageContainer>
   )
}