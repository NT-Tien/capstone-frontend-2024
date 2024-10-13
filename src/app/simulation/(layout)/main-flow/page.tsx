"use client"

import SelectCountsCard from "@/app/simulation/(layout)/main-flow/SelectCounts.card"
import { useSimulationStore } from "@/app/simulation/(layout)/main-flow/store-provider"
import { useMemo } from "react"
import RequestListCard from "@/app/simulation/(layout)/main-flow/RequestList.card"

function Page() {
   const simulation = useSimulationStore((store) => store)

   const hasIds = useMemo(() => {
      return simulation.idLists_fixRequest.length > 0 || simulation.idLists_warrantyRequest.length > 0
   }, [simulation.idLists_fixRequest, simulation.idLists_warrantyRequest])

   return (
      <div className="min-h-screen p-layout">
         {hasIds ? (
            <div>
               <header className="mb-3 flex items-center">
                  <h1 className="text-2xl font-bold">Kết quả</h1>
               </header>
               <div className="grid grid-cols-1 gap-3">
                  <RequestListCard />
               </div>
            </div>
         ) : (
            <div className="grid h-full place-items-center">
               <SelectCountsCard />
            </div>
         )}
      </div>
   )
}

export default Page
