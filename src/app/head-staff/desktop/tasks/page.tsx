"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import headstaff_qk from "@/features/head-maintenance/qk"
import { useRouter, useSearchParams } from "next/navigation"
import { ProTable } from "@ant-design/pro-components"
import dayjs from "dayjs"
import Link from "next/link"
import { CopyToClipboard } from "@/components/utils/CopyToClipboard"
import { PageContainer } from "@ant-design/pro-layout"
import { Suspense, useEffect, useRef, useState } from "react"
import { App, Button, Calendar, Dropdown, Radio, Spin, Tabs, Tag } from "antd"
import { CalendarOutlined, MoreOutlined, OrderedListOutlined } from "@ant-design/icons"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import HeadStaff_Task_All from "@/features/head-maintenance/api/task/all.api"
import { TaskDto } from "@/lib/domain/Task/Task.dto"

export default function Page() {
   return (
      <Suspense fallback={<Spin fullscreen />}>
         <PageContent />
      </Suspense>
   )
}

function PageContent() {
   const currentDefault = 1,
      pageSizeDefault = 10,
      currentStatusDefault = TaskStatus.AWAITING_FIXER

   const searchParams = useSearchParams()
   const { message } = App.useApp()
   const queryClient = useQueryClient()
   const router = useRouter()

   const [current, setCurrent] = useState(Number(searchParams.get("current")) || currentDefault)
   const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || pageSizeDefault)
   const [currentStatus, setCurrentStatus] = useState<TaskStatus>(
      (searchParams.get("status") as TaskStatus) ?? currentStatusDefault,
   )
   const [currentView, setCurrentView] = useState<"list" | "calendar">("list")

   const response = useQuery({
      queryKey: headstaff_qk.task.all({
         page: current.toString(),
         limit: pageSize.toString(),
         status: currentStatus,
      }),
      queryFn: () =>
         HeadStaff_Task_All({
            page: current,
            limit: pageSize,
            status: currentStatus as any,
         }),
   })

   function handleChangeTab(current?: number, pageSize?: number, status?: TaskStatus) {
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
      history.replaceState({}, "", `/head-staff/desktop/tasks?${urlSearchParams.toString()}`)
   }

   useEffect(() => {
      // this dynamically sets the number of rows to fill the screen
      const value = window.innerHeight - 120 - 104 - 104 - 75
      console.log(Math.floor(value / 48))
      setPageSize(Math.floor(value / 48))
   }, [])

   return (
      <PageContainer
         title={`Danh sách tác vụ`}
         breadcrumb={{
            items: [
               {
                  title: "Trang chủ",
                  onClick: () => {
                     router.push("/head-staff/desktop/dashboard")
                  },
               },
               {
                  title: "Tác vụ",
               },
            ],
         }}
      >
         <Tabs
            className="tabs-no-spacing"
            type="card"
            onChange={(key) => {
               handleChangeTab(undefined, undefined, key as TaskStatus)
            }}
            tabBarExtraContent={{
               right: (
                  <Radio.Group
                     key={"list-type"}
                     buttonStyle="solid"
                     defaultValue="list"
                     value={currentView}
                     onChange={(e) => setCurrentView(e.target.value)}
                  >
                     <Radio.Button value="list">
                        <OrderedListOutlined />
                     </Radio.Button>
                     <Radio.Button value="calendar">
                        <CalendarOutlined />
                     </Radio.Button>
                  </Radio.Group>
               ),
            }}
            activeKey={currentStatus}
            items={Object.values(TaskStatus)
               .filter((status) => status !== TaskStatus.AWAITING_SPARE_SPART)
               .map((status) => ({
                  key: status,
                  label: (
                     <span
                        onMouseOver={async () => {
                           await queryClient.prefetchQuery({
                              queryKey: headstaff_qk.task.all({
                                 page: current.toString(),
                                 limit: pageSize.toString(),
                                 status: currentStatus,
                              }),
                              queryFn: () =>
                                 HeadStaff_Task_All({
                                    page: current,
                                    limit: pageSize,
                                    status: currentStatus as any,
                                 }),
                           })
                        }}
                     >
                        {TaskStatusTagMapper[String(status)].text}
                     </span>
                  ),
               }))}
         />
         {currentView === "list" && (
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
               tabStatus={currentStatus as any}
               handleChangeTab={handleChangeTab}
            />
         )}
         {currentView === "calendar" && <Calendar className="p-3" />}
      </PageContainer>
   )
}

type Props = {
   list: TaskDto[] | undefined
   total: number | undefined
   loading: boolean
   refetch: () => Promise<void>
   pageSize: number
   page: number
   tabStatus: TaskStatus
   handleChangeTab: (current?: number, pageSize?: number, status?: TaskStatus) => void
}

function DataView(props: Props) {
   const [isRefetching, setIsRefetching] = useState(false)
   const actionRef = useRef()

   return (
      <ProTable
         headerTitle={
            <div className="flex gap-2">
               <span className="capitalize">{TaskStatusTagMapper[String(props.tabStatus)].text}</span>
               <span className="text-xs font-normal text-gray-500">
                  {props.list?.length ?? "-"} task{props.list?.length === 1 ? "" : "s"} found
               </span>
            </div>
         }
         actionRef={actionRef}
         rowClassName={(_, index) => (index % 2 === 0 ? "" : "bg-neutral-100")}
         dataSource={props.list}
         loading={props.loading || isRefetching}
         options={{
            reload: async () => {
               setIsRefetching(true)
               await props.refetch()
               setIsRefetching(false)
            },
         }}
         pagination={{
            pageSize: props.pageSize,
            showQuickJumper: true,
            showLessItems: true,
            current: props.page,
            total: props.total,
            onChange: (page, pageSize) => {
               props.handleChangeTab(page, pageSize, props.tabStatus)
            },
         }}
         dateFormatter={(value) => value.format("DD/MM/YY HH:mm")}
         search={false}
         virtual={true}
         columns={[
            {
               title: "STT",
               key: "index",
               render: (_, __, index) => index + 1,
               width: 48,
               align: "center",
               hideInSearch: true,
            },
            {
               title: "Tên",
               key: "name",
               dataIndex: "name",
               valueType: "text",
               ellipsis: true,
               width: 230,
            },
            {
               title: "Mức độ ưu tiên",
               key: "priority",
               dataIndex: "priority",
               align: "center",
               width: 95,
               render: (_, e) => (
                  <Tag color={e.priority ? "red-inverse" : "default"}>{e.priority ? "High" : "Low"}</Tag>
               ),
               valueType: "boolean",
            },
            {
               title: "Ngày sửa",
               key: "fixerDate",
               dataIndex: "fixerDate",
               valueType: "date",
               render: (_, e) => dayjs(e.fixerDate).add(7, "hours").format("DD-MM-YYYY"),
               width: 90,
            },
            {
               title: "Thời hạn hoàn thành",
               // tooltip: "Time to Complete (minutes)",
               key: "totalTime",
               dataIndex: "totalTime",
               valueType: "text",
               align: "center",
               width: 120,
               render: (_, e) => e.totalTime,
            },
            {
               title: "Thông số kỹ thuật",
               key: "operator",
               dataIndex: "operator",
               width: 110,
            },
            ...(props.tabStatus === TaskStatus.ASSIGNED
               ? [
                    {
                       title: "Thợ sửa",
                       key: "fixer",
                       render: (_: any, e: any) => e.fixer?.username,
                    },
                 ]
               : []),
            {
               title: "Ngày tạo",
               key: "createdAt",
               dataIndex: "createdAt",
               valueType: "date",
               width: 120,
            },
            {
               title: "Ngày cập nhật",
               key: "updatedAt",
               dataIndex: "updatedAt",
               render: (_, e) =>
                  e.updatedAt === e.createdAt ? "-" : dayjs(e.updatedAt).add(7, "hours").format("DD-MM-YYYY HH:mm"),
               valueType: "date",
               width: 120,
            },
            {
               valueType: "option",
               key: "option",
               align: "right",
               fixed: "right",
               width: 110,
               className: "bg-transparent",
               render: (text, record, _, action) => {
                  return (
                     <div className="flex items-center justify-end gap-1">
                        <Link key={"View"} href={`/head-staff/desktop/tasks/${record.id}`}>
                           <Button type="primary" size="small">
                              Xem thêm
                           </Button>
                        </Link>
                        <Dropdown
                           menu={{
                              items: [CopyToClipboard({ value: record.id })],
                           }}
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
