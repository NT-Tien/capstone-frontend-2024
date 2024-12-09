"use client"

import { PageContainer, ProTable } from "@ant-design/pro-components"
import stockkeeper_queries from "@/features/stockkeeper/queries"
import { ExportStatus } from "@/lib/domain/ExportWarehouse/ExportStatus.enum"
import { useMemo, useRef, useState, useEffect } from "react"
import { Button, DrawerProps } from "antd"
import dayjs, { Dayjs } from "dayjs"
import { ExportType } from "@/lib/domain/ExportWarehouse/ExportType.enum"
import { EyeOutlined } from "@ant-design/icons"
import ExportWarehouse_ViewDetailsDrawer from "@/features/stockkeeper/components/overlay/ExportWarehouse_ViewDetails.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"

type Query = {
   page: number
   pageSize: number
   filters?: {
      task?: {
         fixerDate?: Dayjs
         name?: string
         fixer?: {
            username?: string
         }
      };
      export_type?: ExportType,
   }
}

type ExportWarehouse_ViewDetailsDrawerProps = {
   id?: string
   refetchFn?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   ExportWarehouse_ViewDetailsDrawerProps & {
      handleClose?: () => void
   }

function Page(props: Props) {
   const [tab, setTab] = useState<ExportStatus>(ExportStatus.WAITING)
   const [exportTypeParam, setExportTypeParam] = useState<ExportType | null>(null)
   const [exportTypeString, setExportTypeString] = useState("")
   const [isNotFilter, setIsNotFilter] = useState<boolean>(false)
   const [query, setQuery] = useState<Query>({
      page: 0,
      pageSize: 10,
   })

   const control_exportWarehouseViewDetailsDrawer = useRef<RefType<ExportWarehouse_ViewDetailsDrawerProps>>(null)

   const api_exports = stockkeeper_queries.exportWarehouse.all({})
   const [ticketId, setTicketId] = useState<string>();
   useEffect(() => {
      if (typeof window !== "undefined") {
         const urlParams = new URLSearchParams(window.location.search)
         const exportType = urlParams.get("export_type") as ExportType | null
         if (!exportType) {setIsNotFilter(true)}
         setExportTypeParam(exportType)
         setExportTypeString(urlParams.get("export_type") as string)
         const ticketid = urlParams.get("ticketid")
         if (ticketid) {
            setTicketId(ticketid)
         }
      }
   }, [])

   useEffect(() => {
      if (exportTypeParam) {
         setQuery((prev) => ({
            ...prev,
            filters: { ...prev.filters, export_type: exportTypeParam },
         }))
      }
   }, [exportTypeParam])

   useEffect(() => {
      if (ticketId) {
         control_exportWarehouseViewDetailsDrawer.current?.handleOpen({ id: ticketId })
      }
   }, [ticketId])

   const renderData = useMemo(() => {
      if (!api_exports.isSuccess) return

      let list = api_exports.data

      list = list.filter((item) => {
         if (item.status !== tab) return false

         let result = true

         if (query.filters?.task?.fixerDate) {
            result = result && dayjs(item.task.fixerDate).isSame(query.filters.task.fixerDate, "day")
         }

         if (query.filters?.task?.name) {
            result = result && item.task.name.includes(query.filters.task.name)
         }

         if (query.filters?.export_type) {
            result = result && item.export_type === query.filters.export_type
         }

         if (query.filters?.task?.fixer?.username) {
            result = result && item.task.fixer.username.includes(query.filters.task.fixer.username)
         }

         return result
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

   if (isNotFilter) {return ( 
      <PageContainer
         title={"Đơn xuất kho"}
         tabActiveKey={tab}
         onTabChange={(key) => {
            setTab(key as ExportStatus)
            setQuery({
               page: 0,
               pageSize: 10,
            })
         }}
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
         <ProTable
            dataSource={renderData?.list}
            pagination={{
               pageSize: 10,
               onChange: (page, pageSize) => {
                  setQuery({ page, pageSize })
               },
               total: renderData?.total,
            }}
            search={{
               layout: "vertical",
            }}
            onReset={() => {
               setQuery({
                  page: 0,
                  pageSize: 10,
               })
            }}
            onSubmit={(query) => {
               setQuery({
                  page: 0,
                  pageSize: 10,
                  filters: {
                     ...query,
                  },
               })
            }}
            loading={api_exports.isPending}
            columns={[
               {
                  title: "STT",
                  width: 40,
                  align: "center",
                  fixed: "left",
                  render: (value, record, index) => index + 1,
                  hideInSearch: true,
               },
               {
                  title: "Ngày sửa chữa",
                  dataIndex: ["task", "fixerDate"],
                  render: (_, e) => (dayjs(e.fixerDate).isValid() ? dayjs(e.fixerDate).format("DD/MM/YYYY") : "-"),
                  width: 150,
                  valueType: "date",
               },
               {
                  title: "Loại xuất",
                  dataIndex: "export_type",
                  align: "center",
                  width: 150,
                  valueType: "select",
                  valueEnum: {
                     [ExportType.SPARE_PART]: { text: "Linh kiện" },
                     [ExportType.DEVICE]: { text: "Thiết bị" },
                  },
               },
               {
                  title: "Tác vụ",
                  dataIndex: ["task", "name"],
                  render: (_, e) => e.task?.name,
                  width: 400,
               },
               {
                  title: "Nhân viên",
                  dataIndex: ["task", "fixer", "username"],
               },
               {
                  title: "Số lượng xuất",
                  render: (_, e) => {
                     if (e.export_type === ExportType.SPARE_PART) {
                        return e.detail.reduce((count: any, item: any) => {
                           if ("issueSpareParts" in item && item.issueSpareParts) {
                              count += item.issueSpareParts.length
                           }
                           return count
                        }, 0)
                     } else if (e.export_type === ExportType.DEVICE) {
                        return 1
                     }
                     return 0
                  },
                  width: 150,
                  hideInSearch: true,
               },
               {
                  title: "",
                  hideInSearch: true,
                  fixed: "right",
                  align: "right",
                  render: (_, e) => {
                     return (
                        <div className={"flex items-center justify-end gap-2"}>
                           <Button
                              type={"text"}
                              icon={<EyeOutlined />}
                              onClick={() => control_exportWarehouseViewDetailsDrawer.current?.handleOpen({ id: "69a43517-20de-46f9-9efc-2836de502183" })}
                           >
                              {e.id}
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
   )}

   if (!exportTypeString) {
      return <div>Đang tải dữ liệu...</div>
   }

   return ( 
      <PageContainer
         title={"Đơn xuất kho"}
         tabActiveKey={tab}
         onTabChange={(key) => {
            setTab(key as ExportStatus)
            setQuery({
               page: 0,
               pageSize: 10,
            })
         }}
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
         <ProTable
            dataSource={renderData?.list}
            pagination={{
               pageSize: 10,
               onChange: (page, pageSize) => {
                  setQuery({ page, pageSize })
               },
               total: renderData?.total,
            }}
            search={{
               layout: "vertical",
            }}
            onReset={() => {
               setQuery({
                  page: 0,
                  pageSize: 10,
               })
            }}
            onSubmit={(query) => {
               setQuery({
                  page: 0,
                  pageSize: 10,
                  filters: {
                     ...query,
                  },
               })
            }}
            loading={api_exports.isPending}
            columns={[
               {
                  title: "STT",
                  width: 40,
                  align: "center",
                  fixed: "left",
                  render: (value, record, index) => index + 1,
                  hideInSearch: true,
               },
               {
                  title: "Ngày sửa chữa",
                  dataIndex: ["task", "fixerDate"],
                  render: (_, e) => (dayjs(e.fixerDate).isValid() ? dayjs(e.fixerDate).format("DD/MM/YYYY") : "-"),
                  width: 150,
                  valueType: "date",
               },
               {
                  title: "Loại xuất",
                  dataIndex: "export_type",
                  align: "center",
                  width: 150,
                  valueType: "select",
                  valueEnum: {
                     [ExportType.SPARE_PART]: { text: "Linh kiện" },
                     [ExportType.DEVICE]: { text: "Thiết bị" },
                  },
               },
               {
                  title: "Tác vụ",
                  dataIndex: ["task", "name"],
                  render: (_, e) => e.task?.name,
                  width: 400,
               },
               {
                  title: "Nhân viên",
                  dataIndex: ["task", "fixer", "username"],
               },
               {
                  title: "Số lượng xuất",
                  render: (_, e) => {
                     if (e.export_type === ExportType.SPARE_PART) {
                        return e.detail.reduce((count: any, item: any) => {
                           if ("issueSpareParts" in item && item.issueSpareParts) {
                              count += item.issueSpareParts.length
                           }
                           return count
                        }, 0)
                     } else if (e.export_type === ExportType.DEVICE) {
                        return 1
                     }
                     return 0
                  },
                  width: 150,
                  hideInSearch: true,
               },
               {
                  title: "",
                  hideInSearch: true,
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
            form={{
               initialValues: {
                  export_type: exportTypeString ? exportTypeString : ExportType.DEVICE, 
               },
            }}
         />
         <OverlayControllerWithRef ref={control_exportWarehouseViewDetailsDrawer}>
            <ExportWarehouse_ViewDetailsDrawer refetchFn={api_exports.refetch} />
         </OverlayControllerWithRef>
      </PageContainer>
   )
}

export default Page
