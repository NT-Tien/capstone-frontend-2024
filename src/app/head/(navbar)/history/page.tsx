"use client"

import PageHeader from "@/components/layout/PageHeader"
import { FixRequest_StatusData, FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { Card, Input, Select, Spin } from "antd"
import Image from "next/image"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils/cn.util"
import HistoryList from "./HistoryList.component"
import useRequest_AllQuery from "@/features/head-department/queries/Request_All.query"
import { FilterOutlined, SearchOutlined } from "@ant-design/icons"
import HeadNavigationDrawer from "@/features/head-department/components/layout/HeadNavigationDrawer"
import head_department_queries from "@/features/head-department/queries"

function Page({ searchParams }: { searchParams: { status?: FixRequestStatuses } }) {
   const navDrawer = HeadNavigationDrawer.useDrawer()
   const router = useRouter()

   const [tab, setTab] = useState<FixRequestStatuses | undefined>(searchParams.status ?? "pending")

   const api_requests = head_department_queries.request.all({})

   const filteredRequests = tab
      ? api_requests.data?.filter((req) => req.status === tab.toUpperCase())
      : api_requests.data

   function handleChangeTab(tabKey: FixRequestStatuses) {
      setTab(tabKey as FixRequestStatuses)

      const tabURL = new URLSearchParams()
      tabURL.set("status", tabKey)
      router.push("/head/history?" + tabURL.toString())
   }

   const statusCounts = Object.values(FixRequestStatus).reduce(
      (acc, status) => {
         acc[status] = api_requests.data?.filter((req) => req.status === status).length || 0
         return acc
      },
      {} as Record<FixRequestStatus, number>,
   )

   return (
      <div className="std-layout relative h-full min-h-screen bg-white">
         <PageHeader
            title="Lịch sử yêu cầu"
            className="std-layout-outer relative z-50"
            icon={PageHeader.NavIcon}
            handleClickIcon={() => navDrawer.handleOpen()}
         />
         <Image
            className="std-layout-outer absolute h-32 w-full object-cover opacity-40"
            src="/images/requests.jpg"
            alt="image"
            width={784}
            height={100}
            style={{
               WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               objectFit: "fill",
            }}
         />
         <Input
            type="text"
            className="relative z-30 mb-2 w-full rounded-full border border-neutral-200 bg-neutral-100 px-4 py-3"
            placeholder="Tìm kiếm"
            prefix={<SearchOutlined className="mr-2" />}
            suffix={<FilterOutlined />}
         />

         {/* <Segmented
            className="hide-scrollbar mt-layout w-full overflow-auto"
            value={tab}
            onChange={(value) => handleChangeTab(value as FixRequestStatuses)}
            options={(
               ["pending", "approved", "in_progress", "head_confirm", "closed", "rejected"] as FixRequestStatuses[]
            ).map((status, index, array) => ({
               className: "p-1",
               value: status,
               label: (
                  <div
                     className={cn(
                        "flex w-min items-center justify-center gap-3 break-words font-medium",
                        index === 0 && "ml-layout",
                        index === array.length - 1 && "mr-layout",
                     )}
                  >
                     {FixRequest_StatusData(status).text} ({statusCounts[status.toUpperCase() as FixRequestStatus] || 0}
                     )
                  </div>
               ),
            }))}
         /> */}
         <Select
            className="mb-3 mt-2 w-full text-center"
            size="large"
            value={tab}
            onChange={(value) => handleChangeTab(value as FixRequestStatuses)}
         >
            {(["pending", "approved", "in_progress", "head_confirm", "closed", "rejected"] as FixRequestStatuses[]).map(
               (status, index, array) => (
                  <Select.Option key={status} value={status}>
                     <div
                        className={cn(
                           "items-center justify-center gap-3 break-words text-center font-medium",
                           index === 0 && "text-center",
                           index === array.length - 1 && "text-center",
                        )}
                     >
                        {FixRequest_StatusData(status).text} (
                        {statusCounts[status.toUpperCase() as FixRequestStatus] || 0})
                     </div>
                  </Select.Option>
               ),
            )}
         </Select>
         {api_requests.isPending ? (
            <Card>
               <Spin fullscreen />
            </Card>
         ) : (
            <HistoryList requests={filteredRequests} />
         )}
      </div>
   )
}

export default Page
