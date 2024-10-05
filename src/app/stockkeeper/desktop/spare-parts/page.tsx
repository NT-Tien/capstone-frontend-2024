"use client"

import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { CopyToClipboard } from "@/components/utils/CopyToClipboard"
import { ProTable, TableDropdown } from "@ant-design/pro-components"
import { PageContainer } from "@ant-design/pro-layout"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { Button, Form, InputNumber, Space } from "antd"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import Stockkeeper_MachineModel_All from "../../../../features/stockkeeper/api/machine-model/getAll.api"
import { stockkeeper_qk } from "../../../../features/stockkeeper/api/qk"
import Stockkeeper_SparePart_All, { type Request } from "../../../../features/stockkeeper/api/spare-part/all.api"

const values = {
   nameSingle: "linh kiện",
   nameSingleCapitalized: "Linh Kiện",
   namePlural: "linh kiện",
   namePluralCapitalized: "Linh Kiện",
   namePluralCapitalizedOptional: "Linh Kiện",
   mainQueryFn: Stockkeeper_SparePart_All,
   mainQueryKey: stockkeeper_qk.sparePart.all,
}

export default function DevicesListPage() {
   const router = useRouter()

   const [query, setQuery] = useState<Request>({
      page: 1,
      limit: 10,
   })

   const api_spareParts = useQuery({
      queryKey: values.mainQueryKey(query),
      queryFn: () => values.mainQueryFn(query),
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

   if (api_spareParts.isError) {
      return api_spareParts.error.message
   }

   return (
      <PageContainer
         title={`Danh sách ${values.namePluralCapitalized}`}
         subTitle={`Tổng cộng ${api_spareParts.data?.total ?? "..."} ${values.namePluralCapitalizedOptional} trong kho`}
         extra={[
            <Link key="gotoImport" href="/stockkeeper/desktop/spare-parts/import">
               <Button type="primary">Nhập linh kiện</Button>
            </Link>,
         ]}
      >
         <ProTable<SparePartDto>
            actionRef={actionRef}
            dataSource={api_spareParts.data?.list}
            loading={api_spareParts.isFetching}
            options={{
               reload: async () => {
                  await api_spareParts.refetch()
               },
            }}
            headerTitle="Linh kiện"
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
            onSubmit={(props: any) => {
               console.log(props)
               setQuery((prev) => ({
                  ...prev,
                  ...props,
                  machineModelId: props.machineModel,
               }))
            }}
            onReset={() => {
               router.push("/stockkeeper/desktop/spare-parts?current=1&pageSize=10")
               setQuery({
                  page: 1,
                  limit: 10,
               })
            }}
            pagination={{
               pageSize: query.limit,
               current: query.page,
               total: api_spareParts.data?.total ?? 0,
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
            // scroll={{
            //    x: "max-content",
            // }}
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
                  order: order as any,
                  orderBy: orderBy as any,
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
                  hideInTable: true,
                  valueType: "text",
               },
               {
                  title: "Tên",
                  dataIndex: "name",
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  valueType: "text",
                  render: (_, record) => <a>{record.name}</a>,
                  sorter: true,
               },
               {
                  title: "Mẫu máy",
                  key: "machineModel",
                  render: (_, record) => record?.machineModel?.name ?? "-",
                  width: 200,
                  ellipsis: {
                     showTitle: true,
                  },
                  copyable: true,
                  valueType: "select",
                  valueEnum: machineModels,
                  fieldProps: {
                     showSearch: true,
                  },
               },
               {
                  title: "Số lượng trong kho",
                  dataIndex: "quantity",
                  width: 200,
                  valueType: "digitRange",
                  sorter: true,
                  render: (_, record) => record.quantity,
                  renderFormItem: (item, { type, ...rest }, form) => {
                     if (type === "form") {
                        return null
                     }
                     return (
                        <Space.Compact>
                           <Form.Item name="minQuantity" noStyle>
                              <InputNumber placeholder="Min" style={{ width: 100 }} />
                           </Form.Item>
                           <Form.Item name="maxQuantity" noStyle>
                              <InputNumber placeholder="Max" style={{ width: 100 }} />
                           </Form.Item>
                        </Space.Compact>
                     )
                  },
                  filterDropdown: true,
               },
               {
                  title: "Ngày hết hạn",
                  dataIndex: "expirationDate",
                  valueType: "date",
                  width: 200,
                  hideInSearch: true,
               },
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  valueType: "date",
                  width: 200,
                  sorter: true,
                  hideInSearch: true,
               },
               {
                  title: "Lần trước cập nhật",
                  dataIndex: "updatedAt",
                  valueType: "date",
                  width: 200,
                  sorter: true,
                  hideInSearch: true,
               },
               {
                  title: "Tùy chọn",
                  valueType: "option",
                  width: 100,
                  fixed: "right",
                  key: "option",
                  render: (text, record, _, action) => [
                     <TableDropdown
                        key="actionGroup"
                        onSelect={() => action?.reload()}
                        menus={[CopyToClipboard({ value: record.id })]}
                     />,
                  ],
               },
            ]}
         />
      </PageContainer>
   )
}
