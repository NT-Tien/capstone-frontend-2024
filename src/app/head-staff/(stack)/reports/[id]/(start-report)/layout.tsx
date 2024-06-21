"use client"

import { ReactNode, useState } from "react"
import { Form } from "antd"
import { StartFormFieldType } from "@/app/head-staff/(stack)/reports/[id]/(start-report)/_types/StartContextType"
import StartContext from "@/app/head-staff/(stack)/reports/[id]/(start-report)/_context/StartContext"

export default function StartReportLayout({ children }: { children: ReactNode }) {
   const [form] = Form.useForm<StartFormFieldType>()
   const [spareParts, setSpareParts] = useState<
      {
         issue: string
         quantity: number
         sparePart: string
      }[]
   >([])

   function onSubmit(values: StartFormFieldType) {
      console.log(values)
      console.log(values.issues)
   }

   return (
      <StartContext.Provider value={{ form, spareParts, setSpareParts }}>
         <Form form={form} onFinish={onSubmit}>
            {children}
         </Form>
      </StartContext.Provider>
   )
}
