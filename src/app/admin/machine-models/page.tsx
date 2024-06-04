"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProTable, TableDropdown } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { Button } from "antd"
import { useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import { MachineModelDto } from "@/common/dto/MachineModel.dto"
import MachineModel_All from "@/app/admin/_api/machine-model/all.api"
import CreateMachineModelDrawer from "@/app/admin/machine-models/_components/create-machine-model.drawer"
import { CopyToClipboard } from "@/common/util/copyToClipboard.util"

export default function MachineModelsListPage() {
   const [query, setQuery] = useState<Partial<MachineModelDto>>({})
   const response = useQuery({
      queryKey: qk.machineModels.all(),
      queryFn: () => MachineModel_All(),
   })
   const actionRef = useRef()

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
                     result = result || dayjs(area.dateOfReceipt).isSame(value, "day")
                     break
                  case "warrantyTerm":
                     result = result || dayjs(area.warrantyTerm).isSame(value, "day")
                     break
                  case "createdAt":
                     result = result || dayjs(area.createdAt).isSame(value, "day")
                     break
                  case "updatedAt":
                     result = result || dayjs(area.updatedAt).isSame(value, "day")
                     break
                  case "deletedAt":
                     result =
                        result || value === null
                           ? area.deletedAt === null
                           : dayjs(area.deletedAt).isSame(dayjs(value as string), "day")
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
         title="Machine Models List"
         subTitle={`Total ${responseData?.length ?? "..."} machine models(s) found.`}
         loading={response.isLoading}
         extra={
            <CreateMachineModelDrawer>
               {(handleOpen) => (
                  <Button key="create-area-btn" type="primary" onClick={handleOpen}>
                     Create
                  </Button>
               )}
            </CreateMachineModelDrawer>
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
               layout: "vertical",
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
            virtual
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
                  sorter: (a, b) => dayjs(a.dateOfReceipt).unix() - dayjs(b.dateOfReceipt).unix(),
               },
               {
                  title: "Warranty Term",
                  dataIndex: "warrantyTerm",
                  width: 150,
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.warrantyTerm).unix() - dayjs(b.warrantyTerm).unix(),
               },
               {
                  title: "Created At",
                  dataIndex: "createdAt",
                  width: 150,
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
               },
               {
                  title: "Updated At",
                  dataIndex: "updatedAt",
                  width: 150,
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
                  defaultSortOrder: "descend",
               },
               {
                  title: "Deleted At",
                  dataIndex: "deletedAt",
                  width: 150,
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.deletedAt ?? dayjs()).unix() - dayjs(b.deletedAt ?? dayjs()).unix(),
               },
               {
                  title: "Options",
                  valueType: "option",
                  width: 100,
                  key: "option",
                  render: (text, record, _, action) => [
                     <a
                        key="editable"
                        onClick={() => {
                           action?.startEditable?.(record.id)
                        }}
                     >
                        View/Edit
                     </a>,
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