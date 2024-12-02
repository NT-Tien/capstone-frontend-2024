"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { useMemo, useRef, useState } from "react"
import admin_queries from "@/features/admin/queries"
import dayjs from "dayjs"
import { ProTable } from "@ant-design/pro-components"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import Link from "next/link"
import { Role } from "@/lib/domain/User/role.enum"
import Button from "antd/es/button"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import MachineModel_UpsertDrawer, {
   MachineModel_UpsertDrawerProps,
} from "@/features/admin/components/overlays/MachineModel_Upsert.drawer"
import Device_UpsertDrawer, {
   Device_UpsertDrawerProps,
} from "@/features/admin/components/overlays/Device_Upsert.drawer"

type QueryState = {
   page: number
   limit: number
   search?: {
      name?: string
      createdAt?: string
      updatedAt?: string
      positionX?: number
      positionY?: number
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

   const filtered_api_devices = useMemo(() => {
      if (!api_devices.data)
         return {
            list: [],
            total: 0,
         }

      const filtered = api_devices.data.filter((item) => {
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

         return matchName && matchCreatedAt && matchUpdatedAt && matchPositionX && matchPositionY
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
                     title: "Tên mẫu máy",
                     dataIndex: "name",
                     width: 200,
                     render: (_, entity) => <Link href={`/admin/device/${entity.id}`}>{entity.machineModel.name}</Link>,
                     ellipsis: true,
                  },
                  {
                     title: "Mô tả",
                     dataIndex: "description",
                     width: 200,
                     ellipsis: true,
                     render: (_, entity) => (
                        <div
                           style={{
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              maxWidth: "100%",
                           }}
                           title={entity.description}
                        >
                           {entity.description}
                        </div>
                     ),
                     hideInSearch: true,
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
                     render: (_, entity) =>
                        !entity.positionX || !entity.positionY
                           ? `Chưa xác định`
                           : `${entity.positionX} x ${entity.positionY}`,
                     width: 100,
                     sorter: true,
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
