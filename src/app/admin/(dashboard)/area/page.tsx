"use client"

import admin_queries from "@/features/admin/queries"
import { useMemo, useRef, useState } from "react"
import { PageContainer } from "@ant-design/pro-layout"
import { ProTable } from "@ant-design/pro-components"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import dayjs from "dayjs"
import Link from "next/link"
import Button from "antd/es/button"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Area_CreateDrawer, { AreaUpsertDrawerProps } from "@/features/admin/components/overlays/Area_Upsert.drawer"

type QueryProps = {
   page: number
   limit: number
   search: {
      name?: string
      createdAt?: string
      updatedAt?: string
   }
}

function Page() {
   const control_createAreaDrawer = useRef<RefType<AreaUpsertDrawerProps>>(null)

   const [query, setQuery] = useState<QueryProps>({
      page: 1,
      limit: 10,
      search: {},
   })

   const api_areas = admin_queries.area.all({})

   const filtered_api_areas = useMemo(() => {
      if (!api_areas.data)
         return {
            list: [],
            total: 0,
         }

      const filtered = api_areas.data.filter((item) => {
         const matchName = query.search?.name
            ? item.name.toLowerCase().includes(query.search?.name.toLowerCase())
            : true
         const matchCreatedAt = query.search?.createdAt
            ? dayjs(item.createdAt).isSame(query.search?.createdAt, "day")
            : true
         const matchUpdatedAt = query.search?.updatedAt
            ? dayjs(item.updatedAt).isSame(query.search?.updatedAt, "day")
            : true

         return matchName && matchCreatedAt && matchUpdatedAt
      })

      return {
         list: filtered.slice((query.page - 1) * query.limit, query.page * query.limit),
         total: filtered.length,
      }
   }, [api_areas.data, query])

   return (
      <>
         <PageContainer
            title="Danh sách khu vực"
            extra={
               <Button type="primary" onClick={() => control_createAreaDrawer.current?.handleOpen({})}>
                  Thêm khu vực mới
               </Button>
            }
         >
            <ProTable
               dataSource={filtered_api_areas.list}
               scroll={{ x: "max-content" }}
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
               onSubmit={(props: QueryProps["search"]) => {
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
                  resetText: "Xóa",
               }}
               pagination={{
                  pageSize: query.limit,
                  current: query.page,
                  total: filtered_api_areas.total ?? 0,
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
                     title: "Tên khu vực",
                     dataIndex: "name",
                     width: 150,
                     ellipsis: true,
                     render: (_, e) => <Link href={`/admin/area/${e.id}`}>{e.name}</Link>,
                  },
                  {
                     title: "Mô tả",
                     dataIndex: "instruction",
                     width: 250,
                     ellipsis: true,
                     hideInSearch: true,
                  },
                  {
                     title: "Kích thước",
                     render: (_, e) => `${e.width} x ${e.height}`,
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
         <OverlayControllerWithRef ref={control_createAreaDrawer}>
            <Area_CreateDrawer
               onSuccess={async () => {
                  control_createAreaDrawer.current?.handleClose()
                  await api_areas.refetch()
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default Page
