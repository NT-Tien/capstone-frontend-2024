import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { DeviceDto } from "@/common/dto/Device.dto"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { UserDto } from "@/common/dto/User.dto"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"

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
   confirmReceipt: boolean | null
   fixerDate: string
   device: DeviceDto
   request: FixRequestDto
   fixer: UserDto
   issues: FixRequestIssueDto[]
   confirmReceiptStaffSignature: string
   confirmReceiptStockkeeperSignature: string
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
