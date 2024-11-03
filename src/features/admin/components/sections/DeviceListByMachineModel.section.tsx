"use client"

import admin_queries from "@/features/admin/queries"
import { useRef, useState } from "react"
import { ProTable } from "@ant-design/pro-components"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import dayjs from "dayjs"
import Link from "next/link"
import { Button } from "antd"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Device_UpsertDrawer, { Device_UpsertDrawerProps } from "../overlays/Device_Upsert.drawer"

type Props = {
   machineModelId: string
}

type QueryState = {
   page: number
   limit: number
   search: {
      positionX?: string
      positionY?: string
      area?: string
      description?: string
   }
   sort: {
      order?: "ASC" | "DESC"
      orderBy?: string
   }
}

function DeviceListByMachineModelSection(props: Props) {
   const [query, setQuery] = useState<QueryState>({
      page: 1,
      limit: 10,
      sort: {
         order: "ASC",
         orderBy: "position",
      },
      search: {},
   })

   const api_devices = admin_queries.device.all_filterAndSort({
      page: query.page,
      limit: query.limit,
      filters: {
         machineModelId: props.machineModelId,
         positionX: Number(query.search?.positionX),
         positionY: Number(query.search?.positionY),
         area: query.search?.area,
         description: query.search?.description,
      },
      sort: {
         order: query.sort?.order,
         orderBy: query.sort?.orderBy as any,
      },
   })

   const control_deviceUpsertDrawer = useRef<RefType<Device_UpsertDrawerProps>>(null)

   return (
      <>
         <ProTable
            dataSource={api_devices.data?.list}
            loading={api_devices.isPending}
            scroll={{ x: "max-content" }}
            onSubmit={(props: QueryState["search"]) => {
               setQuery((prev) => ({
                  ...prev,
                  search: {
                     ...props,
                  },
               }))
            }}
            onReset={() => {
               setQuery((prev) => ({
                  page: 1,
                  limit: 10,
                  search: {},
                  sort: {},
               }))
            }}
            onChange={(page, filters, sorter, extra) => {
               let order, orderBy
               if (Array.isArray(sorter)) {
                  order = sorter[0].order === "descend" ? "DESC" : "ASC"
                  orderBy = sorter[0].field
               } else {
                  order = sorter.order === "descend" ? "DESC" : "ASC"
                  orderBy = sorter.field
               }

               setQuery((prev) => ({
                  ...prev,
                  sort: {
                     order: order as any,
                     orderBy: orderBy as any,
                  },
               }))
            }}
            search={{
               layout: "vertical",
               collapseRender: (collapsed) =>
                  collapsed ? (
                     <div className="flex items-center gap-1">
                        Mở
                        <CaretDown />
                     </div>
                  ) : (
                     <div className="flex items-center gap-1">
                        Đóng
                        <CaretUp />
                     </div>
                  ),
               searchText: "Tìm kiếm",
               resetText: "Làm mới",
            }}
            pagination={{
               pageSize: query.limit,
               current: query.page,
               total: api_devices.data?.total ?? 0,
               showQuickJumper: true,
               showLessItems: true,
               onChange: (page, pageSize) => {
                  setQuery((prev) => ({
                     ...prev,
                     page,
                     limit: pageSize,
                  }))
               },
            }}
            toolBarRender={() => [
               <Button
                  key="create"
                  type="primary"
                  onClick={() => {
                     control_deviceUpsertDrawer.current?.handleOpen({})
                  }}
               >
                  Tạo thiết bị
               </Button>,
            ]}
            columns={[
               {
                  title: "ID",
                  dataIndex: "id",
                  hideInTable: true,
                  hideInSearch: true,
               },
               {
                  title: "STT",
                  valueType: "indexBorder",
                  width: 40,
                  align: "center",
                  hideInSearch: true,
                  fixed: "left",
                  render: (value, record, index) => index + 1 + (query.page - 1) * query.limit,
               },
               {
                  title: "Mã máy",
                  dataIndex: "id",
                  width: 100,
                  ellipsis: true,
                  hideInSearch: true,
                  render: (_, e) => <Link href={`/admin/device/${e.id}`}>{e.id}</Link>,
               },
               {
                  title: "Vị trí (X)",
                  dataIndex: ["positionX"],
                  hideInTable: true,
               },
               {
                  title: "Vị trí (Y)",
                  dataIndex: ["positionY"],
                  hideInTable: true,
               },
               {
                  title: "Vị trí",
                  dataIndex: ["position"],
                  render: (_, e) =>
                     !e.positionX || !e.positionY ? `Chưa xác định` : `${e.positionX} x ${e.positionY}`,
                  width: 100,
                  sorter: true,
                  hideInSearch: true,
               },
               {
                  title: "Khu vực",
                  dataIndex: ["area", "name"],
                  key: "area",
               },
               {
                  title: "Mô tả",
                  dataIndex: ["description"],
                  width: 200,
                  ellipsis: true,
                  key: "description",
               },
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  width: 200,
                  render: (_, entity) => dayjs(entity.createdAt).format("DD/MM/YYYY HH:mm"),
                  valueType: "date",
                  sorter: true,
                  hideInSearch: true,
               },
               {
                  title: "Lần cập nhật cuối",
                  dataIndex: "updatedAt",
                  width: 200,
                  render: (_, entity) => dayjs(entity.updatedAt).format("DD/MM/YYYY HH:mm"),
                  sorter: true,
                  valueType: "date",
                  defaultSortOrder: "descend",
                  hideInSearch: true,
               },
            ]}
         />
         <OverlayControllerWithRef ref={control_deviceUpsertDrawer}>
            <Device_UpsertDrawer
               onSuccess={async () => {
                  control_deviceUpsertDrawer.current?.handleClose()
                  await api_devices.refetch()
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default DeviceListByMachineModelSection
