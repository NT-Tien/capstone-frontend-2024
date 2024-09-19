"use client"

import { stockkeeper_qk } from "@/app/stockkeeper/_api/qk"
import Stockkeeper_SparePart_AllAddMore from "@/app/stockkeeper/_api/spare-part/all-addmore"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import { CopyToClipboard } from "@/common/util/copyToClipboard.util"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { RollbackOutlined } from "@ant-design/icons"
import { ProTable, TableDropdown } from "@ant-design/pro-components"
import { PageContainer } from "@ant-design/pro-layout"
import { useQuery } from "@tanstack/react-query"
import { App, Button } from "antd"
import dayjs from "dayjs"
import { useMemo, useRef, useState } from "react"
import UpdateQuantityModal, { UpdateQuantityModalProps } from "./UpdateQuantity.modal"
import Stockkeeper_MachineModel_All from "@/app/stockkeeper/_api/machine-model/getAll.api"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import Link from "next/link"

type types = {
   dto: SparePartDto
}

const values = {
   nameSingle: "linh kiện",
   nameSingleCapitalized: "Linh Kiện",
   namePlural: "linh kiện",
   namePluralCapitalized: "Linh Kiện",
   namePluralCapitalizedOptional: "Linh Kiện",
   mainQueryFn: Stockkeeper_SparePart_AllAddMore,
   mainQueryKey: stockkeeper_qk.sparePart.allNeedMore,
}

export default function DevicesListPage() {
   const { message } = App.useApp()
   const [query, setQuery] = useState<Partial<types["dto"]>>({})
   const api_spareParts = useQuery({
      queryKey: values.mainQueryKey(),
      queryFn: () => values.mainQueryFn(),
      select: (data) => {
         return Object.values(data)
      },
   })

   const api_machineModels = useQuery({
      queryKey: stockkeeper_qk.machineModel.all,
      queryFn: () => Stockkeeper_MachineModel_All({ page: 1, limit: 1000 }),
   })

   const machineModels = useMemo(() => {
      return api_machineModels.data?.list.reduce(
         (acc, item) => {
            acc[item.id] = item.name
            return acc
         },
         {} as Record<string, string>,
      )
   }, [api_machineModels.data?.list])

   const actionRef = useRef()
   const updateQuantityModalRef = useRef<RefType<UpdateQuantityModalProps>>(null)

   const responseData = useMemo(() => {
      return (
         api_spareParts.data?.filter((data) => {
            let result = false
            const queryEntries = Object.entries(query)
            if (queryEntries.length === 0) return true
            for (const [key, value] of queryEntries) {
               switch (key) {
                  case "id":
                     result = result || data.sparePart.id.includes(value as string)
                     break
                  case "name":
                     result = result || data.sparePart.name.includes(value as string)
                     break
                  case "quantity":
                     result = result || Number(data.sparePart.quantity) === Number(value)
                     break
                  case "createdAt":
                     result =
                        result ||
                        dayjs(data.sparePart.createdAt)
                           .add(7, "hours")
                           .isSame(value as string, "day")
                     break
                  case "updatedAt":
                     result =
                        result ||
                        dayjs(data.sparePart.updatedAt)
                           .add(7, "hours")
                           .isSame(value as string, "day")
                     break
               }
            }
            return result
         }) ?? []
      )
   }, [api_spareParts.data, query])

   if (api_spareParts.isError) {
      return api_spareParts.error.message
   }

   return (
      <PageContainer
         title={`${values.namePluralCapitalized} cần thêm`}
         subTitle={`Tổng ${responseData?.length ?? "..."} ${values.namePluralCapitalizedOptional} còn thiếu.`}
         extra={[
            <Link key="update-many" href="/stockkeeper/desktop/spare-parts/import?from=missing">
               <Button type="primary">
                  Nhập kho linh kiện
               </Button>
            </Link>,
         ]}
      >
         <ProTable
            actionRef={actionRef}
            dataSource={responseData ?? []}
            loading={api_spareParts.isFetching}
            options={{
               reload: async () => {
                  await api_spareParts.refetch()
               },
            }}
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
            columns={[
               {
                  title: "STT",
                  valueType: "indexBorder",
                  width: 48,
                  hideInSearch: true,
               },
               {
                  title: "ID",
                  dataIndex: ["sparePart", "id"],
                  hideInTable: true,
                  valueType: "text",
               },
               {
                  title: "Tên linh kiện",
                  dataIndex: ["sparePart", "name"],
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
               },
               {
                  title: "Mẫu máy",
                  dataIndex: ["sparePart", "machineModel", "name"],
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "select",
                  valueEnum: machineModels,
                  fieldProps: {
                     showSearch: true,
                  },
               },
               {
                  title: "Số lượng trong kho",
                  dataIndex: ["sparePart", "quantity"],
                  width: 200,
                  valueType: "digit",
                  render: (_, record) => <span className="text-red-500">{record.sparePart.quantity}</span>,
               },
               {
                  title: "Số lượng cần thêm",
                  dataIndex: ["quantityNeedToAdd"],
                  width: 200,
                  valueType: "digit",
                  render: (_, record) => <span className="text-green-500">+{record.quantityNeedToAdd}</span>,
               },
               {
                  title: "Ngày tạo",
                  dataIndex: ["sparePart", "createdAt"],
                  valueType: "date",
                  width: 200,
                  sorter: (a, b) =>
                     dayjs(a.sparePart.createdAt).add(7, "hours").unix() -
                     dayjs(b.sparePart.createdAt).add(7, "hours").unix(),
               },
               {
                  title: "Lần trước cập nhật",
                  dataIndex: ["sparePart", "updatedAt"],
                  valueType: "date",
                  width: 200,
                  sorter: (a, b) =>
                     dayjs(a.sparePart.updatedAt).add(7, "hours").unix() -
                     dayjs(b.sparePart.updatedAt).add(7, "hours").unix(),
                  defaultSortOrder: "descend",
               },
               {
                  title: "Tùy chọn",
                  valueType: "option",
                  fixed: "right",
                  width: 100,
                  key: "option",
                  render: (text, record, _, action) => [
                     <TableDropdown
                        key="actionGroup"
                        onSelect={() => action?.reload()}
                        menus={[
                           CopyToClipboard({ value: record.sparePart.id }),
                           {
                              key: "update-quantity",
                              name: "Cập nhật số lượng",
                              icon: <RollbackOutlined />,
                              onClick: () => {
                                 updateQuantityModalRef.current?.handleOpen({
                                    sparePart: record.sparePart,
                                    needMore: record.quantityNeedToAdd,
                                 })
                              },
                           },
                        ]}
                     />,
                  ],
               },
            ]}
         />
         <OverlayControllerWithRef ref={updateQuantityModalRef}>
            <UpdateQuantityModal refetchFn={api_spareParts.refetch} />
         </OverlayControllerWithRef>
      </PageContainer>
   )
}
