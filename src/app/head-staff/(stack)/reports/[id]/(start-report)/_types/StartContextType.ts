import { FormInstance } from "antd"
import { Dispatch, SetStateAction } from "react"

export type StartFormFieldType = {
   device: string
   request: string
   totalTime: number
   name: string
   operator: number
   priority: boolean
   issues: {
      taskError: string
      description: string
      fixType: string
   }[]
}

export type StartContextType = {
   form: FormInstance<StartFormFieldType>
   spareParts: {
      issue: string
      quantity: number
      sparePart: string
   }[]
   setSpareParts: Dispatch<
      SetStateAction<
         {
            issue: string
            quantity: number
            sparePart: string
         }[]
      >
   >
}
