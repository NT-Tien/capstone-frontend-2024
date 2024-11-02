import { useMemo, useRef, useState } from "react"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { ProTable } from "@ant-design/pro-components"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import dayjs from "dayjs"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import SparePart_UpsertDrawer, { SparePart_UpsertDrawerProps } from "../overlays/SparePart_Upsert.drawer"
import { Button } from "antd"
import admin_queries from "../../queries"
import Link from "next/link"

type Props = {
   spareParts?: SparePartDto[]
   isLoading?: boolean
   params: {
      id: string
   }
}

type QueryState = {
   page: number
   limit: number
   search?: {
      name?: string
      quantity?: number
      expirationDate?: Date
   }
   sort: {
      order?: "ASC" | "DESC"
      orderBy?: string
   }
}

function SparePartsListSection({ spareParts, isLoading, params }: Props) {
   const [query, setQuery] = useState<QueryState>({
      page: 1,
      limit: 10,
      sort: {
         order: "ASC",
         orderBy: "position",
      },
      search: {},
   })

   const api_sparePart = admin_queries.spare_part.one({ id: params.id })
   const api_spareParts = admin_queries.spare_part.all_filterAndSort({
      page: query.page,
      limit: query.limit,
   })

   const filtered_spareParts = useMemo(() => {
      const filtered = spareParts?.filter((item) => {
         const matchName = query.search?.name
            ? item.name?.toLowerCase().includes(query.search.name.toLowerCase())
            : true
         const matchQuantity = query.search?.quantity ? item.quantity === query.search.quantity : true

         return matchName && matchQuantity
      })

      return {
         list: filtered?.slice((query.page - 1) * query.limit, query.page * query.limit),
         total: filtered?.length,
      }
   }, [spareParts, query])

   const control_sparePartUpsertDrawer = useRef<RefType<SparePart_UpsertDrawerProps>>(null)

   return (
      <>
         <ProTable
            dataSource={filtered_spareParts?.list}
            loading={isLoading}
            scroll={{ x: "max-content" }}
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
                  search: {},
                  sort: {},
               }))
            }}
            pagination={{
               pageSize: query.limit,
               current: query.page,
               total: filtered_spareParts?.total ?? 0,
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
                     control_sparePartUpsertDrawer.current?.handleOpen({})
                  }}
               >
                  Tạo linh kiện
               </Button>,
            ]}
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
                  title: "Tên linh kiện",
                  dataIndex: "name",
                  width: 200,
                  ellipsis: true,
                  render: (_, e) => <Link href={`/admin/spare-part/${e.id}`}>{e.name}</Link>,
               },
               {
                  title: "Số lượng trong kho",
                  width: 200,
                  ellipsis: true,
                  dataIndex: "quantity",
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
               },
            ]}
         />
         <OverlayControllerWithRef ref={control_sparePartUpsertDrawer}>
            <SparePart_UpsertDrawer
               onSuccess={async () => {
                  control_sparePartUpsertDrawer.current?.handleClose()
                  await api_spareParts.refetch()
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default SparePartsListSection
