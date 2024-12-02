"use client"

import HeadStaff_Task_OneById from "@/features/head-maintenance/api/task/one-byId.api"
import DetailsTab from "@/app/HM/(stack)/tasks/[id]/DetailsTab.componen"
import DeviceTab from "@/app/HM/(stack)/tasks/[id]/DeviceTab.component"
import IssuesTab from "@/app/HM/(stack)/tasks/[id]/IssuesTab.component"
import RootHeader from "@/components/layout/RootHeader"
import qk from "@/old/querykeys"
import { DownOutlined, LeftOutlined, LinkOutlined } from "@ant-design/icons"
import { Calendar, ChartDonut, CheckSquareOffset, Clock, MapPin, Note, User, Wrench } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, Descriptions, Divider, Dropdown, Spin, Tabs, Tag, Typography } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import hm_uris from "@/features/head-maintenance/uri"
import DateViewSwitcher from "@/components/DateViewSwitcher"
import dayjs from "dayjs"
import Link from "next/link"
import { cn } from "@/lib/utils/cn.util"
import TaskUtil from "@/lib/domain/Task/Task.util"

export default function TaskDetails({ params }: { params: { id: string } }) {
   return (
      <Suspense fallback={<Spin fullscreen />}>
         <Component params={params} />
      </Suspense>
   )
}

function Component({ params }: { params: { id: string } }) {
   const searchParams = useSearchParams()
   const router = useRouter()
   const [tab, setTab] = useState("details")

   const api = useQuery({
      queryKey: qk.task.one_byId(params.id),
      queryFn: () => HeadStaff_Task_OneById({ id: params.id }),
   })

   function handleBack() {
      if (!api.isSuccess) {
         router.push(hm_uris.navbar.tasks)
      } else {
         router.push(hm_uris.navbar.tasks + "?status=" + api.data.status)
      }
   }

   return (
      // <div className="std-layout">
      // <RootHeader
      //       title="Thông tin chi tiết"
      //       icon={<LeftOutlined />}
      //       onIconClick={() => router.back()}
      //       className="std-layout-outer p-4"
      //    />
      //    <Tabs
      //       className="main-tabs std-layout-outer"
      //       type="line"
      //       activeKey={tab}
      //       onChange={(key) => setTab(key)}
      //       items={[
      //          {
      //             key: "details",
      //             label: (
      //                <div className="flex items-center gap-2">
      //                   <CheckSquareOffset size={16} />
      //                   Tác vụ
      //                </div>
      //             ),
      //          },
      //          {
      //             key: "device",
      //             label: (
      //                <div className="flex items-center gap-2">
      //                   <MapPin size={16} />
      //                   Thiết bị
      //                </div>
      //             ),
      //          },
      //          {
      //             key: "issues",
      //             label: (
      //                <div className="flex items-center gap-2">
      //                   <Wrench size={16} />
      //                   Vấn đề
      //                </div>
      //             ),
      //          },
      //       ]}
      //    />

      // {tab === "details" && <DetailsTab api={api} setTab={setTab} />}
      //    {tab === "device" && <DeviceTab api={api} />}
      //    {tab === "issues" && <IssuesTab api_task={api} />}
      // </div>
      <div className="relative flex min-h-screen flex-col bg-head_maintenance">
         <PageHeaderV2
            prevButton={
               <PageHeaderV2.BackButton
                  onClick={() =>
                     api.isSuccess ? router.push(hm_uris.navbar.tasks + `?status=${api.data.status}`) : router.back()
                  }
               />
            }
            nextButton={<Dropdown menu={{
               items: [
                  {
                     key: "1",
                     label: "Xem yêu cầu",
                     icon: <LinkOutlined />,
                     onClick: () => {
                        if(!api.isSuccess) return
                        if(TaskUtil.isTask_Fix(api.data)) {
                           router.push(hm_uris.stack.requests_id_fix(api.data.request.id))
                           return
                        }

                        if(TaskUtil.isTask_Warranty(api.data)) {
                           router.push(hm_uris.stack.requests_id_warranty(api.data.request.id))
                           return
                        }

                        if(TaskUtil.isTask_Renew(api.data)) {
                           router.push(hm_uris.stack.requests_id_renew(api.data.request.id))
                           return
                        }
                     },
                  }
               ]
            }}>
               <PageHeaderV2.InfoButton />
            </Dropdown>}
            title="Chi tiết tác vụ"
            className={"relative z-50"}
            type={"light"}
         />
         <div className="px-layout">
            <section
               className={cn(
                  "relative z-50 overflow-hidden rounded-lg border-2 border-neutral-200 bg-white p-layout-half shadow-lg",
               )}
            >
               <Descriptions
                  size="small"
                  colon={false}
                  contentStyle={{
                     display: "flex",
                     justifyContent: "flex-end",
                  }}
                  items={[
                     {
                        label: (
                           <div className="flex items-center gap-1">
                              <Calendar size={17} weight="duotone" />
                              <h2>Tên tác vụ</h2>
                           </div>
                        ),
                        children: (
                           <div className="ml-auto overflow-hidden text-ellipsis whitespace-nowrap">
                              {api.data?.name}
                           </div>
                        ),
                     },
                     {
                        label: (
                           <div className="flex items-center gap-1">
                              <User size={17} weight="duotone" />
                              <h2>Mức độ ưu tiên</h2>
                           </div>
                        ),
                        children: api.data?.priority ? <Tag color="red">Cao</Tag> : <Tag color="green">Thấp</Tag>,
                     },
                     {
                        label: (
                           <div className="flex items-center gap-1">
                              <ChartDonut size={17} weight="duotone" />
                              <h2>Tổng thời lượng</h2>
                           </div>
                        ),
                        children: api.data?.totalTime,
                     },
                     {
                        label: (
                           <div className="flex items-center gap-1">
                              <ChartDonut size={17} weight="duotone" />
                              <h2>Thông số kỹ thuật</h2>
                           </div>
                        ),
                        children: api.data?.operator,
                     },
                     {
                        label: (
                           <div className="flex items-center gap-1">
                              <ChartDonut size={17} weight="duotone" />
                              <h2>Ngày sửa</h2>
                           </div>
                        ),
                        children: api.data?.fixerDate ? (
                           <div style={{ fontWeight: "bold" }}>
                              {dayjs(api.data?.fixerDate).add(7, "hours").format("DD/MM/YYYY")}
                           </div>
                        ) : (
                           "-"
                        ),
                     },
                     {
                        label: (
                           <div className="flex items-center gap-1">
                              <ChartDonut size={17} weight="duotone" />
                              <h2>Yêu cầu</h2>
                           </div>
                        ),
                        children: (
                           <Link href={`/HM/requests/${api.data?.request.id}`} prefetch>
                              {api.data?.request.requester_note}
                              <LinkOutlined className="ml-1" />
                           </Link>
                        ),
                     },
                  ]}
               />
            </section>
         </div>
         <Suspense fallback={<Spin />}>
            <div className="flex h-full flex-1 flex-col rounded-t-2xl border-neutral-200 bg-white shadow-fb">
               <div className="task-tabs">
                  <Tabs
                     className="task-tabs"
                     type="line"
                     activeKey={tab}
                     onChange={(key) => setTab(key)}
                     items={[
                        {
                           key: "details",
                           label: (
                              <div className="flex items-center gap-2">
                                 <CheckSquareOffset size={16} />
                                 Tác vụ
                              </div>
                           ),
                        },
                        {
                           key: "device",
                           label: (
                              <div className="flex items-center gap-2">
                                 <MapPin size={16} />
                                 Thiết bị
                              </div>
                           ),
                        },
                        {
                           key: "issues",
                           label: (
                              <div className="flex items-center gap-2">
                                 <Wrench size={16} />
                                 Vấn đề
                              </div>
                           ),
                        },
                     ]}
                  />
               </div>
               {tab === "details" && <DetailsTab api={api} setTab={setTab} />}
               {tab === "device" && <DeviceTab api={api} />}
               {tab === "issues" && <IssuesTab api_task={api} />}
            </div>
         </Suspense>
      </div>
   )
}
