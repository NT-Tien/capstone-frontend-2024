import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { UserDto } from "@/lib/domain/User/User.dto"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { ExportWarehouseDto } from "@/lib/domain/ExportWarehouse/ExportWarehouse.dto"

export type TaskDto = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   fixerNote: string
   name: string
   status: TaskStatus
   priority: boolean
   operator: number
   totalTime: number
   completedAt: string
   imagesVerify: string[]
   videosVerify: string
   fixerDate: string
   device: DeviceDto
   request: RequestDto
   fixer: UserDto
   issues: IssueDto[]
   confirmReceipt: boolean | null
   confirmReceiptStaffSignature: string
   confirmReceiptStockkeeperSignature: string
   device_renew: DeviceDto
   last_issues_data: any
   return_spare_part_data: any
   cancelReason?: string
   export_warehouse_ticket: ExportWarehouseDto[]
   device_static?: DeviceDto
   type: TaskType
}

export enum TaskType {
   FIX = "FIX",
   WARRANTY_SEND = "WARRANTY_SEND",
   WARRANTY_RECEIVE = "WARRANTY_RECEIVE",
   RENEW = "RENEW",
}

export const PriorityTagMapper: {
   [key: string]: {
      textLong: string
      textShort: string
      colorInverse: string
      color: string
   }
} = {
   true: {
      textLong: "High Priority",
      textShort: "High",
      colorInverse: "red-inverse",
      color: "red",
   },
   false: {
      textLong: "Low Priority",
      textShort: "Low",
      colorInverse: "green-inverse",
      color: "green",
   },
   undefined: {
      textLong: "-",
      textShort: "-",
      colorInverse: "default",
      color: "default",
   },
}