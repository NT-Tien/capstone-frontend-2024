"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProTable, TableDropdown } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import { Button } from "antd"
import { CopyToClipboard } from "@/common/util/copyToClipboard.util"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import SpareParts_All from "@/app/admin/_api/spare-parts/all.api"
import CreateSparePartDrawer from "@/app/admin/spare-parts/_components/create-spare-part.drawer"

export default function SparePartsListPage() {
   const [query, setQuery] = useState<Partial<SparePartDto>>({})
   const response = useQuery({
      queryKey: qk.spareParts.all(),
      queryFn: () => SpareParts_All(),
   })
   const actionRef = useRef()

   const responseData = useMemo(() => {
      return (
         response.data?.filter((sparePart) => {
            let result = false
            const queryEntries = Object.entries(query)
            if (queryEntries.length === 0) return true
            for (const [key, value] of queryEntries) {
               switch (key) {
                  case "id":
                     result = result || sparePart.id.includes(value as string)
                     break
                  case "name":
                     result = result || sparePart.name.includes(value as string)
                     break
                  case "quantity":
                     result = result || Number(sparePart.quantity) === Number(value)
                     break
                  // case "machineModel":
                  //    result = result || sparePart.machineModel.name.includes(value as string)
                  //    break
                  case "expirationDate":
                     result = result || dayjs(sparePart.expirationDate).isSame(value as string, "day")
                     break
                  case "createdAt":
                     result = result || dayjs(sparePart.createdAt).isSame(value as string, "day")
                     break
                  case "updatedAt":
                     result = result || dayjs(sparePart.updatedAt).isSame(value as string, "day")
                     break
                  case "deletedAt":
                     result =
                        result || value === null
                           ? sparePart.deletedAt === null
                           : dayjs(sparePart.deletedAt).isSame(dayjs(value as string), "day")
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
         title="Spare Parts List"
         subTitle={`Total ${responseData?.length ?? "..."} spare part(s) found.`}
         loading={response.isLoading}
         extra={
            <CreateSparePartDrawer>
               {(handleOpen) => (
                  <Button key="create-position-btn" type="primary" onClick={handleOpen}>
                     Create
                  </Button>
               )}
            </CreateSparePartDrawer>
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
                  sorter: (a, b) => dayjs(a.expirationDate).unix() - dayjs(b.expirationDate).unix(),
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
