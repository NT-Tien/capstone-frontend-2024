"use client"

import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Device_UpsertDrawer, {
   Device_UpsertDrawerProps,
} from "@/features/admin/components/overlays/Device_Upsert.drawer"
import admin_queries from "@/features/admin/queries"
import DeviceUtil from "@/lib/domain/Device/Device.util"
import { FE_DeviceStatus } from "@/lib/domain/Device/FE_DeviceStatus.enum"
import { ProTable } from "@ant-design/pro-components"
import { PageContainer } from "@ant-design/pro-layout"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import Button from "antd/es/button"
import dayjs from "dayjs"
import Link from "next/link"
import { useMemo, useRef, useState } from "react"

enum WarrantyStatus {
   HAS_WARRANTY = "Còn bảo hành",
   NO_WARRANTY = "Hết bảo hành",
}

type QueryState = {
   page: number
   limit: number
   search?: {
      deviceCode?: string
      name?: string
      createdAt?: string
      updatedAt?: string
      positionX?: number
      positionY?: number
      machineModel?: {
         warrantyTerm?: WarrantyStatus
      }
      area?: {
         name?: string
      }
   }
   sort?: {
      orderBy?: string
      order?: "ASC" | "DESC"
   }
}

function Page() {
   const [query, setQuery] = useState<QueryState>({
      page: 1,
      limit: 10,
      sort: {
         orderBy: "updatedAt",
         order: "DESC",
      },
   })
   const control_deviceUpsertDrawer = useRef<RefType<Device_UpsertDrawerProps>>(null)

   const api_devices = admin_queries.device.all()

   console.log(query)

   const filtered_api_devices = useMemo(() => {
      if (!api_devices.data)
         return {
            list: [],
            total: 0,
         }

      const filtered = api_devices.data.filter((item) => {
         const matchCode = query.search?.deviceCode
            ? item.deviceCode.toLowerCase().includes(query.search.deviceCode.toLowerCase())
            : true
         const matchName = query.search?.name
            ? item.machineModel.name.toLowerCase().includes(query.search.name.toLowerCase())
            : true
         const matchCreatedAt = query.search?.createdAt
            ? dayjs(item.createdAt).isSame(query.search.createdAt, "day")
            : true
         const matchUpdatedAt = query.search?.updatedAt
            ? dayjs(item.updatedAt).isSame(query.search.updatedAt, "day")
            : true
         const matchPositionX = query.search?.positionX !== undefined ? item.positionX === query.search.positionX : true
         const matchPositionY = query.search?.positionY !== undefined ? item.positionY === query.search.positionY : true

         let matchArea = true

         if (query.search?.area?.name) {
            if (item.area?.name && item.positionX && item.positionY) {
               matchArea = item.area.name.toLowerCase().includes(query.search.area.name.toLowerCase())
            } else {
               matchArea = false
            }
         }

         let matchWarranty = true

         if (query.search?.machineModel?.warrantyTerm) {
            if (query.search.machineModel.warrantyTerm as any === "HAS_WARRANTY") {
               matchWarranty = item.machineModel.warrantyTerm
                  ? dayjs().isBefore(dayjs(item.machineModel.warrantyTerm))
                  : false
            } else {
               matchWarranty = item.machineModel.warrantyTerm
                  ? dayjs().isAfter(dayjs(item.machineModel.warrantyTerm)) || !item.machineModel.warrantyTerm
                  : true
            }
         }

         return (
            matchCode &&
            matchName &&
            matchCreatedAt &&
            matchUpdatedAt &&
            matchPositionX &&
            matchPositionY &&
            matchArea &&
            matchWarranty
         )
      })

      if (query.sort) {
         const { order, orderBy } = query.sort
         filtered.sort((a, b) => {
            if (orderBy === "createdAt") {
               if (order === "ASC") {
                  return dayjs(a.createdAt).diff(b.createdAt)
               } else {
                  return dayjs(b.createdAt).diff(a.createdAt)
               }
            }
            if (orderBy === "updatedAt") {
               if (order === "ASC") {
                  return dayjs(a.updatedAt).diff(b.updatedAt)
               } else {
                  return dayjs(b.updatedAt).diff(a.updatedAt)
               }
            }
            return 0
         })
      }

      return {
         list: filtered.slice((query.page - 1) * query.limit, query.page * query.limit),
         total: filtered.length,
      }
   }, [query, api_devices.data])

   return (
      <>
         <PageContainer
            title={"Danh sách thiết bị"}
            extra={
               <Button
                  type="primary"
                  onClick={() => {
                     control_deviceUpsertDrawer.current?.handleOpen({})
                  }}
               >
                  Thêm thiết bị mới
               </Button>
            }
         >
            <ProTable
               dataSource={filtered_api_devices.list}
               loading={api_devices.isPending}
               scroll={{ x: 1500 }}
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
               onSubmit={(props: QueryState["search"]) => {
                  console.log(props)
                  setQuery((prev) => ({
                     ...prev,
                     page: 1,
                     search: {
                        ...props,
                        positionX: props?.positionX ? Number(props.positionX) : undefined,
                        positionY: props?.positionY ? Number(props.positionY) : undefined,
                     },
                  }))
               }}
               onReset={() => {
                  setQuery((prev) => ({
                     page: 1,
                     limit: 10,
                  }))
               }}
               form={{
                  syncToUrl: (values, type) => {
                     const { tab, ...newValues } = values
                     if (type === "get") {
                        return {
                           ...newValues,
                        }
                     }
                     return newValues
                  },
               }}
               toolBarRender={false}
               pagination={{
                  pageSize: query.limit,
                  current: query.page,
                  total: filtered_api_devices?.total ?? 0,
                  showQuickJumper: true,
                  showLessItems: true,
                  className: "px-layout pb-layout",
                  onChange: (page, pageSize) => {
                     setQuery((prev) => ({
                        ...prev,
                        page,
                        limit: pageSize,
                     }))
                  },
               }}
               tableLayout="fixed"
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
                     dataIndex: ["deviceCode"],
                     width: 100,
                     render: (val, entity) => <Link href={`/admin/device/${entity.id}`}>{val}</Link>,
                  },
                  {
                     title: "Tên mẫu máy",
                     dataIndex: ["machineModel", "name"],
                     width: 200,
                     ellipsis: true,
                  },
                  {
                     title: "Bảo hành",
                     dataIndex: ["machineModel", "warrantyTerm"],
                     width: 200,
                     ellipsis: true,
                     hideInTable: true,
                     valueType: "select",
                     valueEnum: WarrantyStatus,
                  },
                  {
                     title: "Bảo hành",
                     dataIndex: ["machineModel", "warrantyTerm"],
                     width: 100,
                     ellipsis: true,
                     hideInSearch: true,
                     render: (_, e) =>
                        e.machineModel.warrantyTerm ? dayjs(e.machineModel.warrantyTerm).format("DD/MM/YYYY") : "-",
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
                     title: "Khu vực",
                     dataIndex: ["area", "name"],
                     hideInTable: true,
                  },
                  {
                     title: "Vị trí",
                     render: (_, e) => {
                        const status = DeviceUtil.getDeviceStatus(e as any)
                        switch (status) {
                           case FE_DeviceStatus.IN_PRODUCTION: {
                              return `${e.area.name} (${e.positionX}, ${e.positionY})`
                           }
                           case FE_DeviceStatus.IN_WAREHOUSE: {
                              return `Trong kho`
                           }
                           case FE_DeviceStatus.ON_HOLD: {
                              return `Trong kho (chờ tác vụ)`
                           }
                           case FE_DeviceStatus.WARRANTY_CENTER_PROCESSING: {
                              return `Trong quá trình bảo hành`
                           }
                           default: {
                              return `Chưa xác định`
                           }
                        }
                     },
                     width: 150,
                     hideInSearch: true,
                  },
                  {
                     title: "Thông số kỹ thuật",
                     dataIndex: "operationStatus",
                     width: 150,
                     hideInSearch: true,
                  },
                  {
                     title: "Ngày tạo",
                     dataIndex: "createdAt",
                     width: 200,
                     render: (_, entity) => dayjs(entity.createdAt).format("DD/MM/YYYY HH:mm"),
                     valueType: "date",
                     sorter: true,
                  },
                  {
                     title: "Lần cập nhật cuối",
                     dataIndex: "updatedAt",
                     width: 200,
                     render: (_, entity) => dayjs(entity.updatedAt).format("DD/MM/YYYY HH:mm"),
                     sorter: true,
                     valueType: "date",
                     defaultSortOrder: "descend",
                  },
               ]}
            />
         </PageContainer>
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

export default Page
