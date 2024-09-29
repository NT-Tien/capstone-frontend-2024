"use client"

import PageHeader from "@/components/layout/PageHeader"
import { FixRequest_StatusData, FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { AddressBook } from "@phosphor-icons/react"
import { Card, Spin, Tabs } from "antd"
import Image from "next/image"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils/cn.util"
import HistoryList from "./HistoryList.component"
import useRequest_AllQuery from "@/features/head-department/queries/Request_All.query"

function Page() {
   return (
      <Suspense fallback={<Spin fullscreen />}>
         <Component />
      </Suspense>
   )
}

function Component() {
   const searchParams = useSearchParams()
   const router = useRouter()
   const [tab, setTab] = useState<FixRequestStatus | undefined>(undefined)

   const { data: requests, isLoading } = useRequest_AllQuery()

   const filteredRequests = tab ? requests?.filter((req) => req.status === tab.toUpperCase()) : requests

   function handleChangeTab(tabKey: FixRequestStatus) {
      setTab(tabKey as FixRequestStatus)

      const tabURL = new URLSearchParams()
      tabURL.set("status", tabKey)
      router.push("/head/history?" + tabURL.toString())
   }

   useEffect(() => {
      const status = searchParams.get("status")

      if (status) {
         const allStatuses = Object.values(FixRequestStatus)
         if (allStatuses.includes(status as FixRequestStatus)) {
            setTab(status as FixRequestStatus)
         }
         return
      }

      setTab(tab)
   }, [searchParams])

   const statusCounts = Object.values(FixRequestStatus).reduce(
      (acc, status) => {
         acc[status] = requests?.filter((req) => req.status === status).length || 0
         return acc
      },
      {} as Record<FixRequestStatus, number>,
   )

   return (
      <div className="std-layout relative h-full min-h-screen bg-white">
         <PageHeader title="Yêu cầu" icon={AddressBook} className="std-layout-outer relative z-30" />
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
         <Tabs
            className="std-layout-outer relative z-30"
            activeKey={tab}
            onChange={(e) => handleChangeTab(e as FixRequestStatus)}
            items={(
               ["pending", "approved", "in_progress", "head_confirm", "closed", "rejected"] as FixRequestStatuses[]
            ).map((status, index, array) => ({
               key: FixRequest_StatusData(status).statusEnum,
               label: (
                  <div
                     className={cn(
                        "flex w-min items-center justify-center gap-3 break-words font-base",
                        index === 0 && "ml-layout",
                        index === array.length - 1 && "mr-layout",
                     )}
                  >
                     {FixRequest_StatusData(status).text} ({statusCounts[status.toUpperCase() as FixRequestStatus] || 0}
                     )
                  </div>
               ),
            }))}
         />
         {isLoading ? (
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
