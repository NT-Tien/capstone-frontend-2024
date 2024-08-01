"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_All30Days from "@/app/head-staff/_api/request/all30Days.api"
import { useRouter, useSearchParams } from "next/navigation"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { ProTable } from "@ant-design/pro-components"
import dayjs from "dayjs"
import Link from "next/link"
import { CopyToClipboard } from "@/common/util/copyToClipboard.util"
import { PageContainer } from "@ant-design/pro-layout"
import { Suspense, useEffect, useRef, useState } from "react"
import { App, Button, Dropdown, Spin, Tabs } from "antd"
import { MoreOutlined } from "@ant-design/icons"
import { cn } from "@/common/util/cn.util"
import { FixRequest_StatusData, FixRequestStatuses } from "@/common/dto/status/FixRequest.status"

export default function Page() {
   return (
      <Suspense fallback={<Spin fullscreen />}>
         <PageContent />
      </Suspense>
   )
}

function PageContent() {
   const currentDefault = 1,
      pageSizeDefault = 9,
      currentStatusDefault = FixRequestStatus.PENDING

   const searchParams = useSearchParams()
   const { message } = App.useApp()
   const queryClient = useQueryClient()
   const router = useRouter()

   const [current, setCurrent] = useState(Number(searchParams.get("current")) || currentDefault)
   const [pageSize, setPageSize] = useState(Number(pageSizeDefault))
   const [currentStatus, setCurrentStatus] = useState<FixRequestStatus>(
      (searchParams.get("status") as FixRequestStatus) ?? currentStatusDefault,
   )

   const response = useQuery({
      queryKey: headstaff_qk.request.all({
         page: current.toString(),
         limit: pageSize.toString(),
         status: currentStatus,
      }),
      queryFn: () =>
         HeadStaff_Request_All30Days({
            page: current,
            limit: pageSize,
            status: currentStatus as any,
         }),
   })

   function handleChangeTab(current?: number, pageSize?: number, status?: FixRequestStatus) {
      const finalCurrent = current ?? currentDefault
      const finalStatus = status ?? currentStatusDefault

      setCurrent(finalCurrent)
      setCurrentStatus(finalStatus)

      const urlSearchParams = new URLSearchParams()
      urlSearchParams.set("current", String(finalCurrent))
      urlSearchParams.set("status", String(finalStatus))
      history.replaceState({}, "", `/head-staff/desktop/requests?${urlSearchParams.toString()}`)
   }

   useEffect(() => {
      // this dynamically sets the number of rows to fill the screen
      const value = window.innerHeight - 120 - 104 - 104 - 75
      console.log(Math.floor(value / 48))
      setPageSize(Math.floor(value / 48))
   }, [])

   return (
      <PageContainer
         title={`Danh sách yêu cầu`}
         breadcrumb={{
            items: [
               {
                  title: "Trang chủ",
                  onClick: () => {
                     router.push("/head-staff/desktop/dashboard")
                  },
               },
               {
                  title: "Yêu cầu",
               },
            ],
         }}
      >
         <Tabs
            className="tabs-no-spacing"
            type="card"
            onChange={(key) => {
               handleChangeTab(undefined, undefined, key as FixRequestStatus)
            }}
            activeKey={currentStatus}
            items={(["pending", "approved", "in_progress", "closed", "rejected"] as FixRequestStatuses[]).map(
               (status) => {
                  const currentStatus = FixRequest_StatusData(status)

                  return {
                     key: currentStatus.statusEnum,
                     label: currentStatus.text,
                  }
               },
            )}
            // items={Object.values(FixRequestStatus).map((status) => ({
            //    key: status,
            //    label: (
            //       <span
            //          onMouseOver={async () => {
            //             await queryClient.prefetchQuery({
            //                queryKey: headstaff_qk.request.all({
            //                   page: current.toString(),
            //                   limit: pageSize.toString(),
            //                   status: status,
            //                }),
            //                queryFn: () =>
            //                   HeadStaff_Request_All30Days({
            //                      page: current,
            //                      limit: pageSize,
            //                      status: status as any,
            //                   }),
            //             })
            //          }}
            //       >
            //          {FixRequestStatusTagMapper[String(status)].text}
            //       </span>
            //    ),
            // }))}
         />
         <DataView
            list={response.data?.list}
            total={response.data?.total}
            loading={response.isLoading}
            refetch={async () => {
               message.destroy("refetched")
               await response.refetch()
               message.success({ content: "Successfully re-fetched data", key: "refetched" })
            }}
            pageSize={pageSize}
            page={current}
            tabStatus={currentStatus}
            handleChangeTab={handleChangeTab}
         />
      </PageContainer>
   )
}

type Props<T extends Record<string, any>> = {
   list: T[] | undefined
   total: number | undefined
   loading: boolean
   refetch: () => Promise<void>
   pageSize: number
   page: number
   tabStatus: string
   handleChangeTab: (current?: number, pageSize?: number, status?: FixRequestStatus) => void
}

function DataView<T extends Record<string, any>>(props: Props<T>) {
   const [isRefetching, setIsRefetching] = useState(false)
   const actionRef = useRef()

   return (
      <ProTable
         headerTitle={
            <div className="flex gap-2">
               <span className="capitalize">{props.tabStatus.toLowerCase()} Requests</span>
               <span className="text-xs font-normal text-gray-500">Tổng {props.total ?? "-"} yêu cầu</span>
            </div>
         }
         rowClassName={(_, index) => (index % 2 === 0 ? "" : "bg-neutral-100/50")}
         actionRef={actionRef}
         dataSource={props.list}
         loading={props.loading || isRefetching}
         options={{
            reload: async () => {
               setIsRefetching(true)
               await props.refetch()
               setIsRefetching(false)
            },
         }}
         // scroll={{
         //    y: 0,
         // }}
         virtual
         pagination={{
            pageSize: props.pageSize,
            showQuickJumper: true,
            showLessItems: true,
            current: props.page,
            total: props.total,
            onChange: (page, pageSize) => {
               props.handleChangeTab(page, pageSize, props.tabStatus as FixRequestStatus)
            },
         }}
         dateFormatter={(value) => value.format("DD/MM/YY HH:mm")}
         search={false}
         bordered
         columns={[
            {
               title: "STT",
               key: "index",
               render: (_, __, index) => index + 1,
               width: 48,
               hideInSearch: true,
               align: "center",
            },
            {
               key: "device",
               title: "Mẫu máy",
               render: (_, e) => e.device.machineModel.name,
            },
            {
               key: "position",
               title: "Vị trí",
               render: (_, e) => `${e.device.area.name} (${e.device.positionX}x${e.device.positionY})`,
               tooltip: "Area (X, Y)",
               width: 300,
            },
            {
               key: "issues",
               title: "Vấn đề",
               width: 70,
               align: "center",
               render: (_, e) => e.issues.length,
            },
            {
               key: "requester_note",
               title: "Ghi chú",
               ellipsis: true,
               render: (_, e) => e.requester_note,
            },
            {
               title: "Ngày tạo",
               key: "createdAt",
               dataIndex: "createdAt",
               valueType: "date",
               width: 130,
               render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("DD-MM-YYYY"),
               sorter: (a, b) => dayjs(a.createdAt).add(7, "hours").unix() - dayjs(b.createdAt).add(7, "hours").unix(),
            },
            {
               title: "Ngày cập nhật",
               key: "updatedAt",
               width: 130,
               render: (_, e) =>
                  e.updatedAt === e.createdAt ? "-" : dayjs(e.updatedAt).add(7, "hours").format("DD-MM-YYYY"),
               valueType: "date",
               sorter: (a, b) => dayjs(a.updatedAt).add(7, "hours").unix() - dayjs(b.updatedAt).add(7, "hours").unix(),
            },
            {
               key: "option",
               align: "right",
               fixed: "right",
               width: 100,
               className: "bg-transparent",
               render: (text, record, index) => {
                  return (
                     <div
                        className={cn(
                           index % 2 !== 0 && "bg-neutral-100",
                           "flex w-full items-center justify-end gap-1",
                        )}
                     >
                        <Link key={"View"} href={`/head-staff/desktop/requests/${record.id}`} className="w-full">
                           <Button type="primary" size="small" className="w-full">
                              Xem thêm
                           </Button>
                        </Link>
                        <Dropdown
                           menu={{
                              items: [CopyToClipboard({ value: record.id })],
                           }}
                           className={"w-8"}
                        >
                           <Button type={"primary"} size={"small"} icon={<MoreOutlined />} />
                        </Dropdown>
                     </div>
                  )
               },
            },
         ]}
      />
   )
}
