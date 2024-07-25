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
import Admin_MachineModel_DeleteSoft from "@/app/admin/_api/machine-model/delete-soft.api"
import Admin_MachineModel_Restore from "@/app/admin/_api/machine-model/restore.api"
import CreateMachineModelDrawer from "@/app/admin/machine-models/_components/create-machine-model.drawer"
import { MachineModelDto } from "@/common/dto/MachineModel.dto"
import Admin_MachineModel_All from "@/app/admin/_api/machine-model/all.api"

type types = {
   dto: MachineModelDto
}

const values = {
   nameSingle: "machine model",
   nameSingleCapitalized: "Machine Model",
   namePlural: "machine models",
   namePluralCapitalized: "Machine Models",
   namePluralCapitalizedOptional: "Machine Models(s)",
   mainQueryFn: Admin_MachineModel_All,
   mainQueryKey: qk.machineModels.all(),
   deleteMutationFn: Admin_MachineModel_DeleteSoft,
   restoreMutationFn: Admin_MachineModel_Restore,
   CreateDrawer: CreateMachineModelDrawer,
   detailsHref: (id: string) => `/admin/machine-model/${id}`,
}

export default function MachineModelListPage() {
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
                  case "description":
                     result = result || area.description.includes(value as string)
                     break
                  case "manufacturer":
                     result = result || area.manufacturer.includes(value as string)
                     break
                  case "yearOfProduction":
                     result = result || Number(area.yearOfProduction) === Number(value)
                     break
                  case "dateOfReceipt":
                     result = result || dayjs(area.dateOfReceipt).add(7, "hours").isSame(dayjs(value as any), "day")
                     break
                  case "warrantyTerm":
                     result = result || dayjs(area.warrantyTerm).add(7, "hours").isSame(dayjs(value as any), "day")
                     break
                  case "createdAt":
                     result = result || dayjs(area.createdAt).add(7, "hours").isSame(dayjs(value as any), "day")
                     break
                  case "updatedAt":
                     result = result || dayjs(area.updatedAt).add(7, "hours").isSame(dayjs(value as any), "day")
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
                  sorter: (a, b) => a.name.localeCompare(b.name),
               },
               {
                  title: "Description",
                  dataIndex: "description",
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "textarea",
                  sorter: (a, b) => a.description.localeCompare(b.description),
               },
               {
                  title: "Year of Production",
                  dataIndex: "yearOfProduction",
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  render: (_, record) => record.yearOfProduction,
                  valueType: "dateYear",
                  sorter: (a, b) => a.yearOfProduction - b.yearOfProduction,
               },
               {
                  title: "Date of Receipt",
                  dataIndex: "dateOfReceipt",
                  width: 150,
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.dateOfReceipt).add(7, "hours").unix() - dayjs(b.dateOfReceipt).add(7, "hours").unix(),
               },
               {
                  title: "Warranty Term",
                  dataIndex: "warrantyTerm",
                  width: 150,
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.warrantyTerm).add(7, "hours").unix() - dayjs(b.warrantyTerm).add(7, "hours").unix(),
               },
               {
                  title: "Created At",
                  dataIndex: "createdAt",
                  width: 150,
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.createdAt).add(7, "hours").unix() - dayjs(b.createdAt).add(7, "hours").unix(),
               },
               {
                  title: "Updated At",
                  dataIndex: "updatedAt",
                  width: 150,
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.updatedAt).add(7, "hours").unix() - dayjs(b.updatedAt).add(7, "hours").unix(),
                  defaultSortOrder: "descend",
               },
               {
                  title: "Deleted At",
                  dataIndex: "deletedAt",
                  width: 150,
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
