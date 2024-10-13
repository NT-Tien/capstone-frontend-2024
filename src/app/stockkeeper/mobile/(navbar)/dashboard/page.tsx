"use client"

import { Card, Skeleton } from "antd"
import HomeHeader from "@/components/layout/HomeHeader"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { stockkeeper_qk } from "@/features/stockkeeper/api/qk"
import Stockkeeper_SparePart_All from "@/features/stockkeeper/api/spare-part/all.api"
import { useRouter } from "next/navigation"
import { Gear } from "@phosphor-icons/react"
import CountUp from "react-countup"
import Stockkeeper_SparePart_AllAddMore from "@/features/stockkeeper/api/spare-part/all-addmore"

export default function DashboardPage() {
   const router = useRouter()

   const api_spareParts = useQuery({
      queryKey: stockkeeper_qk.sparePart.all({ page: 1, limit: 1 }),
      queryFn: () => Stockkeeper_SparePart_All({ page: 1, limit: 1 }),
   })

   const api_sparePartsMissing = useQuery({
      queryKey: stockkeeper_qk.sparePart.allNeedMore(),
      queryFn: () => Stockkeeper_SparePart_AllAddMore(),
      select: (data) => {
         return Object.values(data)
      },
   })

   return (
      <div className="std-layout">
         <div className="std-layout-outer">
            <Image
               className="std-layout-outer absolute h-32 w-full object-cover opacity-40"
               src="/images/background5.jpg"
               alt="image"
               width={784}
               height={100}
               style={{
                  WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
                  maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
                  objectFit: "fill",
               }}
            />
            <div className="std-layout">
               <HomeHeader className="std-layout-inner pb-8 pt-4" />
            </div>
         </div>
         <section className="space-y-2">
            <Card
               className="flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-neutral-200 p-0 text-center shadow-md"
               loading={api_spareParts.isPending}
               onClick={() => router.push("/stockkeeper/mobile/spare-parts")}
               classNames={{
                  body: "w-full",
               }}
               hoverable
            >
               <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-start">
                     <div className="text-lg">Tổng cộng</div>
                     <div className="flex items-center">
                        <div className="text-3xl font-bold">
                           <CountUp end={api_spareParts.isSuccess ? api_spareParts.data.total : 0} separator={","} />
                           <span className="ml-1 text-base font-normal text-neutral-500">linh kiện</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center">
                     <Gear size={45} weight="duotone" />
                  </div>
               </div>
            </Card>
            <Card
               className="flex h-24 w-full items-center justify-between rounded-lg border-2 border-neutral-300 bg-neutral-200 p-0 text-center shadow-md"
               loading={api_sparePartsMissing.isPending}
               onClick={() => router.push("/stockkeeper/mobile/spare-parts/missing")}
               classNames={{
                  body: "w-full",
               }}
               hoverable
            >
               <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-start">
                     <div className="text-lg">Số lượng hết hàng</div>
                     <div className="flex items-center">
                        <div className="text-3xl font-bold">
                           <CountUp
                              end={api_sparePartsMissing.isSuccess ? api_sparePartsMissing.data.length : 0}
                              separator={","}
                           />
                           <span className="ml-1 text-base font-normal text-neutral-500">linh kiện</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center">
                     <Gear size={45} weight="duotone" />
                  </div>
               </div>
            </Card>
         </section>
      </div>
   )
}
