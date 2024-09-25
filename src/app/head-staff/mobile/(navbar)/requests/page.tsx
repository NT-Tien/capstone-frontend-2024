"use client"

import PageHeader from "@/components/layout/PageHeader"
import { FixRequest_StatusData, FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { AddressBook } from "@phosphor-icons/react"
import { Card, Input, Skeleton, Spin, Tabs } from "antd"
import Segmented from "antd/es/segmented"
import Image from "next/image"
import { Suspense, useEffect, useState } from "react"
import TabDetails from "./TabDetails.component"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchOutlined, FilterOutlined } from "@ant-design/icons"
import { useQueries } from "@tanstack/react-query"
import headstaff_qk from "@/features/head-maintenance/qk"
import HeadStaff_Request_All30Days from "@/features/head-maintenance/api/request/all30Days.api"
import { cn } from "@/lib/utils/cn.util"

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

   const counts = useQueries({
      queries: Object.values(FixRequestStatus).map((status) => ({
         queryKey: headstaff_qk.request.all({ page: 1, limit: 1000, status: status }),
         queryFn: () => HeadStaff_Request_All30Days({ limit: 1000, page: 1, status: status }),
      })),
      combine: (results) => {
         return results.reduce(
            (acc, { data }, index) => {
               acc[Object.values(FixRequestStatus)[index]] = data?.total ?? 0
               return acc
            },
            {} as Record<FixRequestStatus, number>,
         )
      },
   })

   function handleChangeTab(tab: FixRequestStatus) {
      setTab(tab)

      const tabURL = new URLSearchParams()
      tabURL.set("status", tab)
      router.push("/head-staff/mobile/requests?" + tabURL.toString())
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

      setTab(FixRequestStatus.PENDING)
   }, [searchParams])

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
                     {/* <div className="text-lg">{FixRequest_StatusData(status).icon}</div> */}
                     {FixRequest_StatusData(status).text} ({counts[status.toUpperCase() as FixRequestStatus]})
                  </div>
               ),
            }))}
         />
         {tab ? (
            <TabDetails status={tab} />
         ) : (
            <Card>
               <Spin fullscreen />
            </Card>
         )}
      </div>
   )
}

export default Page
