"use client"

import HeadStaff_Task_OneById from "@/app/head-staff/_api/task/one-byId.api"
import DetailsTab from "@/app/head-staff/mobile/(stack)/tasks/[id]/DetailsTab.componen"
import DeviceTab from "@/app/head-staff/mobile/(stack)/tasks/[id]/DeviceTab.component"
import IssuesTab from "@/app/head-staff/mobile/(stack)/tasks/[id]/IssuesTab.component"
import RootHeader from "@/common/components/RootHeader"
import qk from "@/common/querykeys"
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
            onIconClick={() =>
               api.isSuccess
                  ? searchParams.get("goto") === "request"
                     ? router.push(`/head-staff/mobile/requests/${api.data.request.id}/approved?tab=tasks`)
                     : router.push("/head-staff/mobile/tasks")
                  : undefined
            }
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
