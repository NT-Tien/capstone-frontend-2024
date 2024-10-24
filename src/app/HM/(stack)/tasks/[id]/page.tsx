"use client"

import HeadStaff_Task_OneById from "@/features/head-maintenance/api/task/one-byId.api"
import DetailsTab from "@/app/HM/(stack)/tasks/[id]/DetailsTab.componen"
import DeviceTab from "@/app/HM/(stack)/tasks/[id]/DeviceTab.component"
import IssuesTab from "@/app/HM/(stack)/tasks/[id]/IssuesTab.component"
import RootHeader from "@/components/layout/RootHeader"
import qk from "@/old/querykeys"
import { LeftOutlined } from "@ant-design/icons"
import { CheckSquareOffset, MapPin, Wrench } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { Spin, Tabs } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

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

   return (
      <div className="std-layout">
         <RootHeader
            title="Thông tin chi tiết"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            className="std-layout-outer p-4"
         />
         <Tabs
            className="main-tabs std-layout-outer"
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

         {tab === "details" && <DetailsTab api={api} setTab={setTab} />}
         {tab === "device" && <DeviceTab api={api} />}
         {tab === "issues" && <IssuesTab api_task={api} />}
      </div>
   )
}
