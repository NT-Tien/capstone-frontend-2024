"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProTable, TableDropdown } from "@ant-design/pro-components"
import { useMutation, useQuery } from "@tanstack/react-query"
import qk from "@/old/querykeys"
import { useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import { App, Button } from "antd"
import { CopyToClipboard } from "@/components/utils/CopyToClipboard"
import { DeleteOutlined, RollbackOutlined } from "@ant-design/icons"
import Link from "next/link"
import Admin_SpareParts_DeleteSoft from "@/features/admin/api/spare-part/delete-soft.api"
import Admin_SpareParts_Restore from "@/features/admin/api/spare-part/restore.api"
import CreateSparePartDrawer from "@/app/admin/spare-parts/_components/create-spare-part.drawer"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import Admin_SpareParts_All from "@/features/admin/api/spare-part/all.api"

type types = {
   dto: SparePartDto
}

const values = {
   nameSingle: "spare part",
   nameSingleCapitalized: "Spare Part",
   namePlural: "spare parts",
   namePluralCapitalized: "Spare Parts",
   namePluralCapitalizedOptional: "Spare Parts(s)",
   mainQueryFn: Admin_SpareParts_All,
   mainQueryKey: qk.spareParts.all,
   deleteMutationFn: Admin_SpareParts_DeleteSoft,
   restoreMutationFn: Admin_SpareParts_Restore,
   CreateDrawer: CreateSparePartDrawer,
   detailsHref: (id: string) => `/admin/spare-parts/${id}`,
}

export default function DevicesListPage() {
   const { message } = App.useApp()
   const [query, setQuery] = useState<Partial<types["dto"]>>({})
   const response = useQuery({
      queryKey: values.mainQueryKey(1, 100),
      queryFn: () => values.mainQueryFn({ page: 1, limit: 100 }),
   })
   const actionRef = useRef()

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
                  case "name":
                     result = result || data.name.includes(value as string)
                     break
                  case "quantity":
                     result = result || Number(data.quantity) === Number(value)
                     break
                  // case "machineModel":
                  //    result = result || data.machineModel.name.includes(value as string)
                  //    break
                  case "expirationDate":
                     result =
                        result ||
                        dayjs(data.expirationDate)
                           .add(7, "hours")
                           .isSame(value as string, "day")
                     break
                  case "createdAt":
                     result =
                        result ||
                        dayjs(data.createdAt)
                           .add(7, "hours")
                           .isSame(value as string, "day")
                     break
                  case "updatedAt":
                     result =
                        result ||
                        dayjs(data.updatedAt)
                           .add(7, "hours")
                           .isSame(value as string, "day")
                     break
                  case "deletedAt":
                     result =
                        result || value === null
                           ? data.deletedAt === null
                           : dayjs(data.deletedAt)
                                .add(7, "hours")
                                .isSame(dayjs(value as string), "day")
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
         title={`${values.namePluralCapitalized} List`}
         subTitle={`Total ${responseData?.length ?? "..."} ${values.namePluralCapitalizedOptional}(s) found.`}
         loading={response.isLoading}
         extra={
            <values.CreateDrawer>
               {(handleOpen) => (
                  <Button key="create-position-btn" type="primary" onClick={handleOpen}>
                     Create
                  </Button>
               )}
            </values.CreateDrawer>
         }
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
                  title: "No.",
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
               {
                  title: "Name",
                  dataIndex: "name",
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
               },
               // {
               //    title: "Machine Model",
               //    key: "machineModel",
               //    render: (_, record) => record.machineModel.name,
               //    width: 200,
               //    ellipsis: {
               //       showTitle: true,
               //    },
               //    valueType: "text",
               // },
               {
                  title: "Quantity",
                  dataIndex: "quantity",
                  width: 100,
                  valueType: "digit",
               },
               {
                  title: "Expiration Date",
                  dataIndex: "expirationDate",
                  valueType: "date",
                  sorter: (a, b) =>
                     dayjs(a.expirationDate).add(7, "hours").unix() - dayjs(b.expirationDate).add(7, "hours").unix(),
               },
               {
                  title: "Created At",
                  dataIndex: "createdAt",
                  valueType: "date",
                  sorter: (a, b) =>
                     dayjs(a.createdAt).add(7, "hours").unix() - dayjs(b.createdAt).add(7, "hours").unix(),
               },
               {
                  title: "Updated At",
                  dataIndex: "updatedAt",
                  valueType: "date",
                  sorter: (a, b) =>
                     dayjs(a.updatedAt).add(7, "hours").unix() - dayjs(b.updatedAt).add(7, "hours").unix(),
                  defaultSortOrder: "descend",
               },
               {
                  title: "Deleted At",
                  dataIndex: "deletedAt",
                  valueType: "date",
                  sorter: (a, b) =>
                     dayjs(a.deletedAt ?? dayjs())
                        .add(7, "hours")
                        .unix() -
                     dayjs(b.deletedAt ?? dayjs())
                        .add(7, "hours")
                        .unix(),
               },
               {
                  title: "Options",
                  valueType: "option",
                  width: 100,
                  key: "option",
                  render: (text, record, _, action) => [
                     <Link key={"View"} href={values.detailsHref(record.id)}>
                        View
                     </Link>,
                     <TableDropdown
                        key="actionGroup"
                        onSelect={() => action?.reload()}
                        menus={[
                           CopyToClipboard({ value: record.id }),
                           {
                              key: record.deletedAt ? "restore" : "delete",
                              icon: record.deletedAt ? <RollbackOutlined /> : <DeleteOutlined />,
                              name: record.deletedAt ? "Restore" : "Delete",
                              danger: true,
                              onClick: async () => {
                                 record.deletedAt
                                    ? await mutate_restore.mutateAsync({ id: record.id })
                                    : await mutate_delete.mutateAsync({ id: record.id })
                              },
                           },
                        ]}
                     />,
                  ],
               },
            ]}
         />
      </PageContainer>
   )
}
