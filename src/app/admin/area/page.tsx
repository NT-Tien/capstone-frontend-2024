"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProTable, TableDropdown } from "@ant-design/pro-components"
import { useMutation, useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import { App, Button } from "antd"
import { CopyToClipboard } from "@/common/util/copyToClipboard.util"
import { AreaDto } from "@/common/dto/Area.dto"
import CreateAreaDrawer from "@/app/admin/area/_components/create-area.drawer"
import Admin_Areas_DeleteSoft from "@/app/admin/_api/areas/delete-soft.api"
import { DeleteOutlined, RollbackOutlined } from "@ant-design/icons"
import Admin_Areas_Restore from "@/app/admin/_api/areas/restore.api"
import Link from "next/link"
import Admin_Areas_All from "@/app/admin/_api/areas/all.api"

type types = {
   dto: AreaDto
}

const values = {
   nameSingle: "area",
   nameSingleCapitalized: "Area",
   namePlural: "areas",
   namePluralCapitalized: "Areas",
   namePluralCapitalizedOptional: "Area(s)",
   mainQueryFn: Admin_Areas_All,
   mainQueryKey: qk.areas.all(),
   deleteMutationFn: Admin_Areas_DeleteSoft,
   restoreMutationFn: Admin_Areas_Restore,
   CreateDrawer: CreateAreaDrawer,
   detailsHref: (id: string) => `/admin/area/${id}`,
}

export default function AreasListPage() {
   const { message } = App.useApp()
   const [query, setQuery] = useState<Partial<types["dto"]>>({})
   const response = useQuery({
      queryKey: values.mainQueryKey,
      queryFn: () => values.mainQueryFn(),
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
         response.data?.filter((area) => {
            let result = false
            const queryEntries = Object.entries(query)
            if (queryEntries.length === 0) return true
            for (const [key, value] of queryEntries) {
               switch (key) {
                  case "id":
                     result = result || area.id.includes(value as string)
                     break
                  case "name":
                     result = result || area.name.includes(value as string)
                     break
                  case "instruction":
                     result = result || area.instruction.includes(value as string)
                     break
                  case "width":
                     result = result || Number(area.width) === value
                     break
                  case "height":
                     result = result || Number(area.height) === value
                     break
                  case "createdAt":
                     result = result || dayjs(area.createdAt).add(7, "hours").isSame(value as string, "day")
                     break
                  case "updatedAt":
                     result = result || dayjs(area.updatedAt).add(7, "hours").isSame(value as string, "day")
                     break
                  case "deletedAt":
                     result =
                        result || value === null
                           ? area.deletedAt === null
                           : dayjs(area.deletedAt).add(7, "hours").isSame(dayjs(value as string), "day")
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
                  key: "index",
                  valueType: "indexBorder",
                  width: 48,
                  hideInSearch: true,
               },
               {
                  title: "ID",
                  key: "id",
                  dataIndex: "id",
                  hideInTable: true,
                  valueType: "text",
               },
               {
                  title: "Name",
                  key: "name",
                  dataIndex: "name",
                  width: 200,
                  ellipsis: true,
                  valueType: "text",
               },
               {
                  title: "Instruction",
                  key: "instruction",
                  dataIndex: "instruction",
                  width: 200,
                  ellipsis: true,
                  valueType: "text",
               },
               {
                  title: "Width",
                  key: "width",
                  dataIndex: "width",
                  width: 100,
                  valueType: "digit",
               },
               {
                  title: "Height",
                  key: "height",
                  dataIndex: "height",
                  width: 100,
                  valueType: "digit",
               },
               {
                  title: "Created At",
                  key: "createdAt",
                  dataIndex: "createdAt",
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.createdAt).add(7, "hours").unix() - dayjs(b.createdAt).add(7, "hours").unix(),
               },
               {
                  title: "Updated At",
                  key: "updatedAt",
                  dataIndex: "updatedAt",
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.updatedAt).add(7, "hours").unix() - dayjs(b.updatedAt).add(7, "hours").unix(),
                  defaultSortOrder: "descend",
               },
               {
                  title: "Deleted At",
                  key: "deletedAt",
                  dataIndex: "deletedAt",
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.deletedAt ?? dayjs()).add(7, "hours").unix() - dayjs(b.deletedAt ?? dayjs()).add(7, "hours").unix(),
               },
               {
                  title: "Options",
                  valueType: "option",
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
