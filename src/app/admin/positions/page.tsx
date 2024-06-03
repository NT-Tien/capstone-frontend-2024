"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProTable, TableDropdown } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import { PositionDto } from "@/common/dto/Position.dto"
import Positions_All from "@/app/admin/_api/positions/all.api"
import CreatePositionDrawer from "@/app/admin/positions/_components/create-position.drawer"
import { Button } from "antd"

export default function PositionsListPage() {
   const [query, setQuery] = useState<Partial<PositionDto>>({})
   const response = useQuery({
      queryKey: qk.positions.all(),
      queryFn: () => Positions_All(),
   })
   const actionRef = useRef()

   const responseData = useMemo(() => {
      return (
         response.data?.filter((position) => {
            let result = false
            const queryEntries = Object.entries(query)
            if (queryEntries.length === 0) return true
            for (const [key, value] of queryEntries) {
               switch (key) {
                  case "id":
                     result = result || position.id.includes(value as string)
                     break
                  case "area":
                     console.log(position.area.name, value)
                     result = result || position.area.name.includes(value as string)
                     break
                  case "positionX":
                     result = result || Number(position.positionX) === value
                     break
                  case "positionY":
                     result = result || Number(position.positionY) === value
                     break
                  case "createdAt":
                     result = result || dayjs(position.createdAt).isSame(value as string, "day")
                     break
                  case "updatedAt":
                     result = result || dayjs(position.updatedAt).isSame(value as string, "day")
                     break
                  case "deletedAt":
                     result =
                        result || value === null
                           ? position.deletedAt === null
                           : dayjs(position.deletedAt).isSame(dayjs(value as string), "day")
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
         title="Positions List"
         subTitle={`Total ${responseData?.length ?? "..."} positions(s) found.`}
         loading={response.isLoading}
         extra={
            <CreatePositionDrawer>
               {(handleOpen) => (
                  <Button key="create-position-btn" type="primary" onClick={handleOpen}>
                     Create
                  </Button>
               )}
            </CreatePositionDrawer>
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
                  title: "Area",
                  key: "area",
                  render: (_, record) => record.area.name,
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
               },
               {
                  title: "Position X",
                  dataIndex: "positionX",
                  width: 100,
                  valueType: "digit",
               },
               {
                  title: "Position Y",
                  dataIndex: "positionY",
                  width: 100,
                  valueType: "digit",
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
                        menus={[{ key: "copy", name: "Copy" }]}
                     />,
                  ],
               },
            ]}
         />
      </PageContainer>
   )
}
