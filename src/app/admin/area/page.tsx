"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProTable, TableDropdown } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { Button } from "antd"
import { useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import { AreaDto } from "@/common/dto/Area.dto"
import Areas_All from "@/app/admin/_api/areas/all.api"
import CreateAreaDrawer from "@/app/admin/area/_components/create-area.drawer"
import { CopyToClipboard } from "@/common/util/copyToClipboard.util"

export default function AreasListPage() {
   const [query, setQuery] = useState<Partial<AreaDto>>({})
   const response = useQuery({
      queryKey: qk.areas.all(),
      queryFn: () => Areas_All(),
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
         title="Areas List"
         subTitle={`Total ${responseData?.length ?? "..."} areas(s) found.`}
         loading={response.isLoading}
         extra={
            <CreateAreaDrawer>
               {(handleOpen) => (
                  <Button key="create-area-btn" type="primary" onClick={handleOpen}>
                     Create
                  </Button>
               )}
            </CreateAreaDrawer>
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
                  title: "Instruction",
                  dataIndex: "instruction",
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "textarea",
                  sorter: (a, b) => a.instruction.localeCompare(b.instruction),
               },
               {
                  title: "Width",
                  dataIndex: "width",
                  width: 100,
                  valueType: "digit",
                  sorter: (a, b) => a.width - b.width,
               },
               {
                  title: "Height",
                  dataIndex: "height",
                  width: 100,
                  valueType: "digit",
                  sorter: (a, b) => a.height - b.height,
               },
               {
                  title: "Created At",
                  dataIndex: "createdAt",
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
               },
               {
                  title: "Updated At",
                  dataIndex: "updatedAt",
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
                  defaultSortOrder: "descend",
               },
               {
                  title: "Deleted At",
                  dataIndex: "deletedAt",
                  valueType: "date",
                  sorter: (a, b) => dayjs(a.deletedAt ?? dayjs()).unix() - dayjs(b.deletedAt ?? dayjs()).unix(),
               },
               {
                  title: "Options",
                  valueType: "option",
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
