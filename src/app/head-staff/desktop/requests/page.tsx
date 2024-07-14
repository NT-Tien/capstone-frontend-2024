"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_All30Days from "@/app/head-staff/_api/request/all30Days.api"
import { useRouter, useSearchParams } from "next/navigation"
import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"
import { ProTable } from "@ant-design/pro-components"
import dayjs from "dayjs"
import Link from "next/link"
import { CopyToClipboard } from "@/common/util/copyToClipboard.util"
import { PageContainer } from "@ant-design/pro-layout"
import { Suspense, useRef, useState } from "react"
import { App, Button, Dropdown, Spin, Tabs } from "antd"
import { MoreOutlined } from "@ant-design/icons"
import { cn } from "@/common/util/cn.util"

const RequestStatusToText = {
   [IssueRequestStatus.PENDING]: "Pending",
   [IssueRequestStatus.APPROVED]: "Approved",
   [IssueRequestStatus.REJECTED]: "Rejected",
}

const currentDefault = 1,
   pageSizeDefault = 9,
   currentStatusDefault = IssueRequestStatus.PENDING

export default function Page() {
   return (
      <Suspense fallback={<Spin fullscreen />}>
         <PageContent />
      </Suspense>
   )
}

function PageContent() {
   const searchParams = useSearchParams()
   const [current, setCurrent] = useState(Number(searchParams.get("current")) || currentDefault)
   const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || pageSizeDefault)
   const [currentStatus, setCurrentStatus] = useState<IssueRequestStatus>(
      (searchParams.get("status") as IssueRequestStatus) ?? currentStatusDefault,
   )
   const { message } = App.useApp()
   const queryClient = useQueryClient()
   const router = useRouter()

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

   function handleChangeTab(current?: number, pageSize?: number, status?: IssueRequestStatus) {
      const finalCurrent = current ?? currentDefault
      const finalPageSize = pageSize ?? pageSizeDefault
      const finalStatus = status ?? currentStatusDefault

      setCurrent(finalCurrent)
      setPageSize(finalPageSize)
      setCurrentStatus(finalStatus)

      const urlSearchParams = new URLSearchParams()
      urlSearchParams.set("current", String(finalCurrent))
      urlSearchParams.set("pageSize", String(finalPageSize))
      urlSearchParams.set("status", String(finalStatus))
      history.replaceState({}, "", `/head-staff/desktop/requests?${urlSearchParams.toString()}`)
   }

   return (
      <PageContainer
         title={`Requests List`}
         breadcrumb={{
            items: [
               {
                  title: "Dashboard",
                  onClick: () => {
                     router.push("/head-staff/desktop/dashboard")
                  },
               },
               {
                  title: "Requests",
               },
            ],
         }}
      >
         <Tabs
            className="tabs-no-spacing"
            type="card"
            onChange={(key) => {
               handleChangeTab(undefined, undefined, key as IssueRequestStatus)
            }}
            activeKey={currentStatus}
            items={Object.values(IssueRequestStatus).map((status) => ({
               key: status,
               label: (
                  <span
                     onMouseOver={async () => {
                        await queryClient.prefetchQuery({
                           queryKey: headstaff_qk.request.all({
                              page: current.toString(),
                              limit: pageSize.toString(),
                              status: status,
                           }),
                           queryFn: () =>
                              HeadStaff_Request_All30Days({
                                 page: current,
                                 limit: pageSize,
                                 status: status as any,
                              }),
                        })
                     }}
                  >
                     {RequestStatusToText[status]}
                  </span>
               ),
            }))}
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
   handleChangeTab: (current?: number, pageSize?: number, status?: IssueRequestStatus) => void
}

function DataView<T extends Record<string, any>>(props: Props<T>) {
   const [isRefetching, setIsRefetching] = useState(false)
   const actionRef = useRef()

   return (
      <ProTable
         headerTitle={
            <div className="flex gap-2">
               <span className="capitalize">{props.tabStatus.toLowerCase()} Requests</span>
               <span className="text-xs font-normal text-gray-500">Total {props.total ?? "-"} request(s)</span>
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
         scroll={{
            y: 500,
         }}
         virtual
         pagination={{
            pageSize: props.pageSize,
            showQuickJumper: true,
            showLessItems: true,
            current: props.page,
            total: props.total,
            onChange: (page, pageSize) => {
               props.handleChangeTab(page, pageSize, props.tabStatus as IssueRequestStatus)
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
               title: "Machine Model",
               width: "0px",
               render: (_, e) => e.device.machineModel.name,
            },
            {
               key: "position",
               title: "Position",
               render: (_, e) => `${e.device.area.name} (${e.device.positionX}x${e.device.positionY})`,
               tooltip: "Area (X, Y)",
               width: 150,
            },
            {
               key: "issues",
               title: "No. Issues",
               width: 100,
               align: "center",
               render: (_, e) => e.issues.length,
            },
            {
               key: "requester_note",
               title: "Requester Note",
               ellipsis: true,
               render: (_, e) => e.requester_note,
            },
            {
               title: "Created At",
               key: "createdAt",
               dataIndex: "createdAt",
               valueType: "date",
               width: 200,
               render: (_, e) => dayjs(e.createdAt).format("DD-MM-YYYY"),
               sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
            },
            {
               title: "Updated At",
               key: "updatedAt",
               width: 200,
               render: (_, e) => (e.updatedAt === e.createdAt ? "-" : dayjs(e.updatedAt).format("DD-MM-YYYY")),
               valueType: "date",
               sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
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
                              View
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
