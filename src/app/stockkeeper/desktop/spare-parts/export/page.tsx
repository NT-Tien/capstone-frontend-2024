"use client"

import { PageContainer } from "@ant-design/pro-components"
import stockkeeper_queries from "@/features/stockkeeper/queries"
import { ExportStatus } from "@/lib/domain/ExportWarehouse/ExportStatus.enum"
import { useMemo, useRef, useState } from "react"
import { Button, Table } from "antd"
import dayjs from "dayjs"
import { ExportType } from "@/lib/domain/ExportWarehouse/ExportType.enum"
import { EyeOutlined } from "@ant-design/icons"
import ExportWarehouse_ViewDetailsDrawer, {
   ExportWarehouse_ViewDetailsDrawerProps,
} from "@/features/stockkeeper/components/overlay/ExportWarehouse_ViewDetails.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"

type Query = {
   page: number
   pageSize: number
}

function Page() {
   const [tab, setTab] = useState<ExportStatus>(ExportStatus.WAITING)
   const [query, setQuery] = useState<Query>({
      page: 0,
      pageSize: 10,
   })

   const control_exportWarehouseViewDetailsDrawer = useRef<RefType<ExportWarehouse_ViewDetailsDrawerProps>>(null)

   const api_exports = stockkeeper_queries.exportWarehouse.all({})

   const renderData = useMemo(() => {
      if (!api_exports.isSuccess) return

      let list = api_exports.data

      list = list.filter((item) => {
         return item.status === tab
      })

      return { list: list.slice(query.page * query.pageSize, (query.page + 1) * query.pageSize), total: list.length }
   }, [api_exports.data, api_exports.isSuccess, query, tab])

   const statusCounts = useMemo(() => {
      if (!api_exports.isSuccess) return

      return api_exports.data.reduce(
         (acc, item) => {
            acc[item.status] = (acc[item.status] ?? 0) + 1
            return acc
         },
         {
            WAITING: 0,
            DELAY: 0,
            ACCEPTED: 0,
            EXPORTED: 0,
            CANCEL: 0,
         } as Record<ExportStatus, number>,
      )
   }, [api_exports.data, api_exports.isSuccess])

   return (
      <PageContainer
         title={"Đơn xuất kho"}
         tabActiveKey={tab}
         onTabChange={(key) => setTab(key as ExportStatus)}
         tabList={[
            {
               key: ExportStatus.WAITING,
               tab: `Chưa xử lý (${statusCounts?.WAITING ?? "-"})`,
            },
            {
               key: ExportStatus.DELAY,
               tab: `Trì hoãn (${statusCounts?.DELAY ?? "-"})`,
            },
            {
               key: ExportStatus.ACCEPTED,
               tab: `Đã duyệt (${statusCounts?.ACCEPTED ?? "-"})`,
            },
            {
               key: ExportStatus.EXPORTED,
               tab: `Đã xuất (${statusCounts?.EXPORTED ?? "-"})`,
            },
            {
               key: ExportStatus.CANCEL,
               tab: `Đã hủy (${statusCounts?.CANCEL ?? "-"})`,
            },
         ]}
      >
         <Table
            dataSource={renderData?.list}
            pagination={{
               pageSize: 10,
               onChange: (page, pageSize) => {
                  setQuery({ page, pageSize })
               },
               total: renderData?.total,
            }}
            loading={api_exports.isPending}
            columns={[
               {
                  title: "STT",
                  width: 40,
                  align: "center",
                  fixed: "left",
                  render: (value, record, index) => index + 1,
               },
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY"),
                  width: 150,
               },
               {
                  title: "Xuất",
                  dataIndex: "export_type",
                  render: (value) => {
                     return value === ExportType.SPARE_PART ? "Linh kiện" : "Thiết bị"
                  },
                  width: 150,
               },
               {
                  title: "Tác vụ",
                  render: (_, e) => e.task.name,
                  width: 400,
               },
               {
                  title: "Số lượng xuất",
                  render: (_, e) => e.detail.flatMap((i) => i.issueSpareParts).length,
                  width: 150,
               },
               {
                  title: "",
                  fixed: "right",
                  align: "right",
                  render: (_, e) => {
                     return (
                        <div className={"flex items-center justify-end gap-2"}>
                           <Button
                              type={"text"}
                              icon={<EyeOutlined />}
                              onClick={() => control_exportWarehouseViewDetailsDrawer.current?.handleOpen({ id: e.id })}
                           >
                              Chi tiết
                           </Button>
                        </div>
                     )
                  },
               },
            ]}
         />
         <OverlayControllerWithRef ref={control_exportWarehouseViewDetailsDrawer}>
            <ExportWarehouse_ViewDetailsDrawer refetchFn={api_exports.refetch} />
         </OverlayControllerWithRef>
      </PageContainer>
   )
}

export default Page
