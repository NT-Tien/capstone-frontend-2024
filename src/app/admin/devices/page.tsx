"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { ProTable, TableDropdown } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { Button } from "antd"
import { useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import { CopyToClipboard } from "@/common/util/copyToClipboard.util"
import { DeviceDto } from "@/common/dto/Device.dto"
import Devices_All from "@/app/admin/_api/devices/all.api"
import CreateDeviceDrawer from "@/app/admin/devices/_components/create-device.drawer"

export default function DevicesListPage() {
   const [query, setQuery] = useState<Partial<DeviceDto>>({})
   const response = useQuery({
      queryKey: qk.devices.all(),
      queryFn: () => Devices_All(),
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
                  case "description":
                     result = result || area.description.includes(value as string)
                     break
                  case "operationStatus":
                     result = result || Number(area.operationStatus) === Number(value)
                     break
                  case "machineModel":
                     result = result || area.machineModel.name.includes(value as string)
                     break
                  case "positionX":
                     result = result || Number(area.position.positionX) === Number(value)
                     break
                  case "positionY":
                     result = result || Number(area.position.positionY) === Number(value)
                     break
                  case "createdAt":
                     result = result || dayjs(area.createdAt).isSame(value as string, "day")
                     break
                  case "updatedAt":
                     result = result || dayjs(area.updatedAt).isSame(value as string, "day")
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
         title="Devices List"
         subTitle={`Total ${responseData?.length ?? "..."} device(s) found.`}
         loading={response.isLoading}
         extra={
            <CreateDeviceDrawer>
               {(handleOpen) => (
                  <Button key="create-area-btn" type="primary" onClick={handleOpen}>
                     Create
                  </Button>
               )}
            </CreateDeviceDrawer>
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
                  title: "Machine Model",
                  dataIndex: "machineModel",
                  width: 200,
                  render: (_, record) => record.machineModel.name,
                  valueType: "text",
                  ellipsis: {
                     showTitle: true,
                  },
                  sorter: (a, b) => a.machineModel.name.localeCompare(b.machineModel.name),
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
                  key: "area",
                  title: "Area",
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  render: (_, record) => record.position.area.name,
                  valueType: "text",
                  sorter: (a, b) => a.position.area.name.localeCompare(b.position.area.name),
               },
               {
                  key: "positionX",
                  title: "Position X",
                  width: 100,
                  valueType: "digit",
                  render: (_, record) => record.position.positionX,
               },
               {
                  key: "positionY",
                  title: "Position Y",
                  width: 100,
                  valueType: "digit",
                  render: (_, record) => record.position.positionY,
               },
               {
                  title: "Operation Status",
                  dataIndex: "operationStatus",
                  width: 150,
                  valueType: "digit",
                  sorter: (a, b) => a.operationStatus - b.operationStatus,
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
