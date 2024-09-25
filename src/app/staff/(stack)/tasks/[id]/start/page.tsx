"use client"

import Step0 from "@/app/staff/(stack)/tasks/[id]/start/Step0.component"
import Step1 from "@/app/staff/(stack)/tasks/[id]/start/Step1.component"
import Step2 from "@/app/staff/(stack)/tasks/[id]/start/Step2.component"
import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_OneById from "@/app/staff/_api/task/one-byId.api"
import RootHeader from "@/components/layout/RootHeader"
import { useQuery } from "@tanstack/react-query"
import {
   Spin
} from "antd"
import { useRouter } from "next/navigation"
import { CSSProperties, useState } from "react"

export default function StartTask({ params }: { params: { id: string } }) {
   const [currentStep, setCurrentStep] = useState<number>(1)
   const router = useRouter()

   const response = useQuery({
      queryKey: staff_qk.task.one_byId(params.id),
      queryFn: () => Staff_Task_OneById({ id: params.id }),
   })

   return (
      <div className="std-layout pb-28">
         <RootHeader title="Thông tin chi tiết" className="std-layout-outer p-4" />
         {currentStep === -1 && <Spin fullscreen={true} />}
         {currentStep === 0 && (
            <Step0
               data={response.data?.issues ?? []}
               id={params.id}
               handleBack={() => router.push("/staff/tasks")}
               handleNext={() => setCurrentStep((prev) => prev + 1)}
               confirmReceipt={response.data?.confirmReceipt ?? false}
            />
         )}
         {currentStep === 1 && (
            <Step1
               handleBack={() => setCurrentStep((prev) => prev - 1)}
               handleNext={() => setCurrentStep((prev) => prev + 1)}
               refetch={response.refetch}
               data={response.data}
               loading={response.isLoading}
               id={params.id}
            />
         )}
         {currentStep === 2 && (
            <Step2
               id={params.id}
               handleBack={() => setCurrentStep((prev) => prev - 1)}
               handleNext={() => {
                  router.push("/staff/tasks")
               }}
            />
         )}
      </div>
   )
}

export type GeneralProps = {
   style?: CSSProperties
   className?: string
   handleNext?: () => void
   handleBack?: () => void
}
