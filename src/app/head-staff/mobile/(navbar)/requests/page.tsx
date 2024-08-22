"use client"

import PageHeader from "@/common/components/PageHeader"
import { FixRequest_StatusData, FixRequestStatuses } from "@/common/dto/status/FixRequest.status"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { AddressBook } from "@phosphor-icons/react"
import { Card, Input, Skeleton, Spin } from "antd"
import Segmented from "antd/es/segmented"
import Image from "next/image"
import { Suspense, useEffect, useState } from "react"
import TabDetails from "./TabDetails.component"
import { useRouter, useSearchParams } from "next/navigation"

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
            className="std-layout-outer absolute left-0 top-0 z-0 h-24 w-full object-fill opacity-40"
            src="/images/requests.jpg"
            width={784}
            height={240}
            alt="image"
         />
         <Input
            type="text"
            className="relative z-30 w-full rounded-full border border-neutral-200 bg-neutral-100 px-4 py-3"
            placeholder="Tìm kiếm"
         />
         <Segmented
            onChange={handleChangeTab}
            value={tab}
            size="large"
            options={(["pending", "approved", "in_progress", "head_confirm", "closed", "rejected"] as FixRequestStatuses[]).map(
               (status) => ({
                  className: "p-1",
                  value: FixRequest_StatusData(status).statusEnum,
                  label: (
                     <div className="flex w-min flex-col items-center justify-center break-words font-medium">
                        {FixRequest_StatusData(status).text}
                     </div>
                  ),
               }),
            )}
            className="hide-scrollbar mt-layout w-full overflow-auto"
         />
         <section className="mt-layout">
            {tab ? (
               <TabDetails status={tab} />
            ) : (
               <Card>
                  <Spin fullscreen />
               </Card>
            )}
         </section>
      </div>
   )
}

export default Page
