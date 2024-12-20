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

type QueryState = {
   page: number
   limit: number
   search?: {
      name?: string
      warrantyTerm?: string
      manufacturer?: string
      yearOfProduction?: string
      createdAt?: string
      updatedAt?: string
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
   const control_machineModelUpsertDrawer = useRef<RefType<MachineModel_UpsertDrawerProps>>(null)

   const api_machineModels = admin_queries.machine_model.all({ withDevices: true })

   const filtered_api_machineModels = useMemo(() => {
      if (!api_machineModels.data)
         return {
            list: [],
            total: 0,
         }

      const filtered = api_machineModels.data.filter((item) => {
         const matchName = query.search?.name
            ? item.name?.toLowerCase().includes(query.search.name.toLowerCase())
            : true
         const matchCreatedAt = query.search?.createdAt
            ? dayjs(item.createdAt).isSame(query.search.createdAt, "day")
            : true
         const matchUpdatedAt = query.search?.updatedAt
            ? dayjs(item.updatedAt).isSame(query.search.updatedAt, "day")
            : true
         const matchWarrantyTerm = query.search?.warrantyTerm
            ? dayjs(item.warrantyTerm).isSame(query.search.warrantyTerm, "day")
            : true
         const matchManufacturer = query.search?.manufacturer
            ? item.manufacturer?.toLowerCase().includes(query.search.manufacturer.toLowerCase())
            : true
         const matchYearOfProduction = query.search?.yearOfProduction
            ? item.yearOfProduction?.toString().includes(query.search.yearOfProduction)
            : true

         return (
            matchName &&
            matchCreatedAt &&
            matchUpdatedAt &&
            matchWarrantyTerm &&
            matchManufacturer &&
            matchYearOfProduction
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
            if (orderBy === "warrantyTerm") {
               if (order === "ASC") {
                  return dayjs(a.warrantyTerm).diff(b.warrantyTerm)
               } else {
                  return dayjs(b.warrantyTerm).diff(a.warrantyTerm)
               }
            }
            if (orderBy === "devices") {
               if (order === "ASC") {
                  return a.devices.length - b.devices.length
               } else {
                  return b.devices.length - a.devices.length
               }
            }

            return 0
         })
      }

      return {
         list: filtered.slice((query.page - 1) * query.limit, query.page * query.limit),
         total: filtered.length,
      }
   }, [query, api_machineModels.data])

   return (
      <>
         <PageContainer
            title={"Danh sách mẫu máy"}
            extra={
               <Button
                  type="primary"
                  onClick={() => {
                     control_machineModelUpsertDrawer.current?.handleOpen({})
                  }}
               >
                  Thêm mẫu máy mới
               </Button>
            }
         >
            <ProTable
               dataSource={filtered_api_machineModels.list}
               loading={api_machineModels.isPending}
               scroll={{ x: "max-content" }}
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
                  total: filtered_api_machineModels?.total ?? 0,
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
               columns={[
                  {
                     title: "ID",
                     dataIndex: "id",
                     hideInTable: true,
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
                     render: (_, entity) => <Link href={`/admin/machine-model/${entity.id}`}>{entity.name}</Link>,
                     ellipsis: true,
                  },
                  {
                     title: "Nhà sản xuất",
                     dataIndex: "manufacturer",
                     width: 200,
                  },
                  {
                     title: "Năm sản xuất",
                     dataIndex: "yearOfProduction",
                     width: 200,
                  },
                  {
                     title: "Hạn bảo hành",
                     dataIndex: "warrantyTerm",
                     width: 200,
                     render: (_, entity) =>
                        entity.warrantyTerm ? dayjs(entity.warrantyTerm).format("DD/MM/YYYY") : "-",
                     valueType: "date",
                     sorter: true,
                     renderFormItem: (item, { type, defaultRender, ...rest }, form) => (
                        <div>
                           {defaultRender(item)}
                           <div>
                              <span>VD: {dayjs().format("DD/MM/YYYY")}</span>
                           </div>
                        </div>
                     ),
                  },
                  {
                     title: "Số lượng thiết bị",
                     dataIndex: "devices",
                     width: 200,
                     render: (_, entity) => entity.devices.length,
                     sorter: true,
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
                     title: "Lần trước cập nhật",
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
         <OverlayControllerWithRef ref={control_machineModelUpsertDrawer}>
            <MachineModel_UpsertDrawer
               onSuccess={async () => {
                  control_machineModelUpsertDrawer.current?.handleClose()
                  await api_machineModels.refetch()
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default Page
