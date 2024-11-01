import { useMemo, useRef, useState } from "react"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { ProTable } from "@ant-design/pro-components"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import dayjs from "dayjs"
import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"
import { Button } from "antd"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import TypeError_UpsertDrawer, { TypeError_UpsertDrawerProps } from "../overlays/TypeError_Upsert.drawer"
import admin_queries from "../../queries"

type Props = {
   typeErrors?: TypeErrorDto[]
   isLoading?: boolean
}

type QueryState = {
   page: number
   limit: number
   search?: {
      name?: string
      duration?: number
      description?: string
   }
   sort: {
      order?: "ASC" | "DESC"
      orderBy?: string
   }
}

function TypeErrorsListSection({ typeErrors, isLoading }: Props) {
   const [query, setQuery] = useState<QueryState>({
      page: 1,
      limit: 10,
      search: {},
      sort: {
         order: "ASC",
         orderBy: "position",
      },
   })

   const api_typeError = admin_queries.type_error.all_filterAndSort({
      page: query.page,
      limit: query.limit,
      search: {
         id: undefined,
         name: undefined,
         priority: undefined,
         status: undefined,
         machineModelId: undefined,
         deviceId: undefined,
         requestId: undefined,
         fixerName: undefined,
         confirmReceipt: undefined,
         fixerDate: undefined,
         totalTime: undefined,
         is_warranty: undefined,
      },
      order: {
         order: undefined,
         orderBy: undefined,
      },
   })

   const filtered_typeErrors = useMemo(() => {
      const filtered = typeErrors?.filter((item) => {
         const matchName = query.search?.name
            ? item.name?.toLowerCase().includes(query.search.name.toLowerCase())
            : true
         const matchDuration = query.search?.duration ? item.duration === query.search.duration : true

         return matchName && matchDuration
      })

      return {
         list: filtered?.slice((query.page - 1) * query.limit, query.page * query.limit),
         total: filtered?.length,
      }
   }, [typeErrors, query])

   const control_typeErrorUpsertDrawer = useRef<RefType<TypeError_UpsertDrawerProps>>(null)

   return (
      <>
         <ProTable
            dataSource={filtered_typeErrors?.list}
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
               total: filtered_typeErrors?.total ?? 0,
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
                     control_typeErrorUpsertDrawer.current?.handleOpen({})
                  }}
               >
                  Tạo lỗi mới
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
                  title: "Tên lỗi",
                  dataIndex: "name",
                  width: 200,
                  ellipsis: true,
               },
               {
                  title: "Thời gian sửa",
                  width: 200,
                  ellipsis: true,
                  dataIndex: "duration",
                  render: (_, e) => `${e.duration} phút`,
               },
               {
                  title: "Mô tả",
                  dataIndex: "description",
                  width: 400,
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
                  hideInSearch: true,
               },
            ]}
         />
         <OverlayControllerWithRef ref={control_typeErrorUpsertDrawer}>
            <TypeError_UpsertDrawer
               onSuccess={async () => {
                  control_typeErrorUpsertDrawer.current?.handleClose()
                  await api_typeError.refetch()
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default TypeErrorsListSection
