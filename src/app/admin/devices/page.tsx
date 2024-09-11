"use client"

import Admin_Devices_All from "@/app/admin/_api/devices/all.api"
import Admin_Devices_DeleteSoft from "@/app/admin/_api/devices/delete-soft.api"
import Admin_Devices_Restore from "@/app/admin/_api/devices/restore.api"
import CreateDeviceDrawer from "@/app/admin/devices/_components/create-device.drawer"
import QrCodeModal from "@/app/admin/devices/_components/QrCode.modal"
import { DeviceDto } from "@/common/dto/Device.dto"
import qk from "@/common/querykeys"
import { CopyToClipboard } from "@/common/util/copyToClipboard.util"
import { DeleteOutlined, DownloadOutlined, QrcodeOutlined, RollbackOutlined } from "@ant-design/icons"
import { ActionType, ProTable, TableDropdown } from "@ant-design/pro-components"
import { PageContainer } from "@ant-design/pro-layout"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Button, Flex } from "antd"
import dayjs from "dayjs"
import Link from "next/link"
import { Key, useMemo, useRef, useState } from "react"

type types = {
   dto: DeviceDto
}

const values = {
   nameSingle: "device",
   nameSingleCapitalized: "Device",
   namePlural: "devices",
   namePluralCapitalized: "Devices",
   namePluralCapitalizedOptional: "Device(s)",
   mainQueryFn: Admin_Devices_All,
   mainQueryKey: qk.devices.all(),
   deleteMutationFn: Admin_Devices_DeleteSoft,
   restoreMutationFn: Admin_Devices_Restore,
   CreateDrawer: CreateDeviceDrawer,
   detailsHref: (id: string) => `/admin/devices/${id}`,
}

export default function DevicesListPage({ searchParams }: { searchParams: { area?: string } }) {
   const { message } = App.useApp()
   const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
   const [query, setQuery] = useState<Partial<types["dto"]>>({
      area: (searchParams.area as any) ?? undefined,
   })
   const response = useQuery({
      queryKey: values.mainQueryKey,
      queryFn: () => values.mainQueryFn(),
   })
   const actionRef = useRef<ActionType | undefined>(undefined)

   function onSelectChange(newSelectedRowKeys: Key[]) {
      setSelectedRowKeys(newSelectedRowKeys)
   }

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
                  case "description":
                     result = result || area.description.includes(value as string)
                     break
                  case "operationStatus":
                     result = result || Number(area.operationStatus) === Number(value)
                     break
                  case "area":
                     result = result || area.area.name.includes(value as string)
                     break
                  case "machineModel":
                     result = result || area.machineModel.name.includes(value as string)
                     break
                  case "positionX":
                     result = result || Number(area.positionX) === Number(value)
                     break
                  case "positionY":
                     result = result || Number(area.positionY) === Number(value)
                     break
                  case "createdAt":
                     result =
                        result ||
                        dayjs(area.createdAt)
                           .add(7, "hours")
                           .isSame(value as string, "day")
                     break
                  case "updatedAt":
                     result =
                        result ||
                        dayjs(area.updatedAt)
                           .add(7, "hours")
                           .isSame(value as string, "day")
                     break
                  case "deletedAt":
                     result =
                        result || value === null
                           ? area.deletedAt === null
                           : dayjs(area.deletedAt)
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
         <QrCodeModal>
            {(handleOpen) => (
               <ProTable
                  actionRef={actionRef}
                  dataSource={responseData ?? []}
                  loading={response.isFetching}
                  options={{
                     reload: async () => {
                        await response.refetch()
                     },
                  }}
                  rowKey="id"
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
                  rowSelection={{
                     selectedRowKeys,
                     onChange: onSelectChange,
                     columnWidth: 48,
                  }}
                  tableAlertOptionRender={({}) => (
                     <Flex gap={6}>
                        <Button type="link" icon={<DownloadOutlined />}>
                           Download QR Codes
                        </Button>
                        <Button type="link" onClick={() => setSelectedRowKeys([])}>
                           Clear
                        </Button>
                     </Flex>
                  )}
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
                        key: "id",
                        hideInTable: true,
                        valueType: "text",
                     },
                     {
                        key: "machineModel",
                        title: "Mẫu máy",
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
                        key: "description",
                        title: "Mô tả",
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
                        title: "Khu vực",
                        width: 200,
                        ellipsis: {
                           showTitle: true,
                        },
                        render: (_, record) => record.area.name,
                        valueType: "text",
                        sorter: (a, b) => a.area.name.localeCompare(b.area.name),
                     },
                     {
                        key: "positionX",
                        dataIndex: "positionX",
                        title: "Vị trí (X)",
                        width: 100,
                        valueType: "digit",
                        render: (_, record) => record.positionX,
                     },
                     {
                        key: "positionY",
                        title: "Vị trí (Y)",
                        dataIndex: "positionY",
                        width: 100,
                        valueType: "digit",
                        render: (_, record) => record.positionY,
                     },
                     {
                        key: "operationStatus",
                        title: "Thông số",
                        dataIndex: "operationStatus",
                        width: 200,
                        valueType: "digit",
                        sorter: (a, b) => a.operationStatus - b.operationStatus,
                     },
                     {
                        key: "createdAt",
                        title: "Ngày tạo",
                        dataIndex: "createdAt",
                        width: 150,
                        valueType: "date",
                        sorter: (a, b) =>
                           dayjs(a.createdAt).add(7, "hours").unix() - dayjs(b.createdAt).add(7, "hours").unix(),
                     },
                     {
                        key: "updatedAt",
                        title: "Lần cập nhật cuối",
                        dataIndex: "updatedAt",
                        width: 200,
                        valueType: "date",
                        sorter: (a, b) =>
                           dayjs(a.updatedAt).add(7, "hours").unix() - dayjs(b.updatedAt).add(7, "hours").unix(),
                        defaultSortOrder: "descend",
                     },
                     {
                        key: "deletedAt",
                        title: "Ngày xóa",
                        dataIndex: "deletedAt",
                        width: 150,
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
                        title: "Lựa chọn",
                        valueType: "option",
                        width: 100,
                        key: "option",
                        fixed: "right",
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
                                    key: "getQR",
                                    icon: <QrcodeOutlined />,
                                    name: "Get QR Code",
                                    onClick: () => handleOpen(record.id),
                                 },
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
            )}
         </QrCodeModal>
      </PageContainer>
   )
}
