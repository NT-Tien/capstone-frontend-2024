"use client"

import admin_queries from "@/features/admin/queries"
import { useState } from "react"
import { ProTable } from "@ant-design/pro-components"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import dayjs from "dayjs"

type Props = {
   areaId: string
}

type QueryState = {
   page: number
   limit: number
   search: {
      positionX?: string
      positionY?: string
   }
   sort: {
      order?: "ASC" | "DESC"
      orderBy?: string
   }
}

function DeviceListByAreaSection(props: Props) {
   const [query, setQuery] = useState<QueryState>({
      page: 1,
      limit: 10,
      sort: {
         order: "ASC",
         orderBy: "position",
      },
   })

   const api_devices = admin_queries.device.all_filterAndSort({
      page: query.page,
      limit: query.limit,
      filters: {
         areaId: props.areaId,
         positionX: query.search?.positionX,
         positionY: query.search?.positionY,
      },
      sort: {
         order: query.sort?.order,
         orderBy: query.sort?.orderBy,
      },
   })

   return (
      <ProTable
         dataSource={api_devices.data?.list}
         loading={api_devices.isPending}
         scroll={{ x: "max-content" }}
         onSubmit={(props: QueryType["search"]) => {
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
            }))
         }}
         onChange={(page, filters, sorter, extra) => {
            console.log(sorter.field)
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
               render: (_, e) => `${e.positionX} x ${e.positionY}`,
               width: 100,
               sorter: true,
               hideInSearch: true,
            },
            {
               title: "Mẫu máy",
               dataIndex: ["machineModel", "name"],
               width: 200,
               ellipsis: true,
               hideInSearch: true,
            },
            {
               title: "Mô tả",
               dataIndex: ["description"],
               width: 200,
               ellipsis: true,
               hideInSearch: true,
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
               title: "Lần trước cập nhật",
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
   )
}

export default DeviceListByAreaSection
