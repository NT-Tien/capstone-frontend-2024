"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import { useRouter, useSearchParams } from "next/navigation"
import { ProTable } from "@ant-design/pro-components"
import dayjs from "dayjs"
import Link from "next/link"
import { CopyToClipboard } from "@/common/util/copyToClipboard.util"
import { PageContainer } from "@ant-design/pro-layout"
import { Suspense, useEffect, useRef, useState } from "react"
import { App, Button, Calendar, Dropdown, Radio, Spin, Tabs, Tag } from "antd"
import { CalendarOutlined, MoreOutlined, OrderedListOutlined } from "@ant-design/icons"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import HeadStaff_Task_All from "@/app/head-staff/_api/task/all.api"
import { TaskDto } from "@/common/dto/Task.dto"

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
         title={`Tasks List`}
         breadcrumb={{
            items: [
               {
                  title: "Dashboard",
                  onClick: () => {
                     router.push("/head-staff/desktop/dashboard")
                  },
               },
               {
                  title: "Tasks",
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
               .filter((status) => status !== TaskStatus.PENDING_STOCK)
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
                        {TaskStatusTagMapper[String(TaskStatusTagMapper)].text}
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
               <span className="capitalize">{TaskStatusToText[props.tabStatus]} Tasks</span>
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
               title: "No.",
               key: "index",
               render: (_, __, index) => index + 1,
               width: 48,
               align: "center",
               hideInSearch: true,
            },
            {
               title: "Name",
               key: "name",
               dataIndex: "name",
               valueType: "text",
               ellipsis: true,
               width: 250,
            },
            {
               title: "Priority",
               key: "priority",
               dataIndex: "priority",
               align: "center",
               width: 75,
               render: (_, e) => (
                  <Tag color={e.priority ? "red-inverse" : "default"}>{e.priority ? "High" : "Low"}</Tag>
               ),
               valueType: "boolean",
            },
            {
               title: "Due Date",
               key: "fixerDate",
               dataIndex: "fixerDate",
               valueType: "date",
               render: (_, e) => dayjs(e.fixerDate).format("DD-MM-YYYY"),
               width: 120,
            },
            {
               title: "TTC",
               tooltip: "Time to Complete (minutes)",
               key: "totalTime",
               dataIndex: "totalTime",
               valueType: "text",
               align: "center",
               width: 80,
               render: (_, e) => e.totalTime,
            },
            {
               title: "Operator",
               key: "operator",
               dataIndex: "operator",
               width: 100,
            },
            ...(props.tabStatus === TaskStatus.ASSIGNED
               ? [
                    {
                       title: "Fixer",
                       key: "fixer",
                       render: (_: any, e: any) => e.fixer?.username,
                    },
                 ]
               : []),
            {
               title: "Created At",
               key: "createdAt",
               dataIndex: "createdAt",
               valueType: "date",
               width: 120,
            },
            {
               title: "Updated At",
               key: "updatedAt",
               dataIndex: "updatedAt",
               render: (_, e) => (e.updatedAt === e.createdAt ? "-" : dayjs(e.updatedAt).format("DD-MM-YYYY HH:mm")),
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
                              View
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
