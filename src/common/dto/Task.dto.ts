import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { DeviceDto } from "@/common/dto/Device.dto"
import { IssueRequestDto } from "@/common/dto/IssueRequest.dto"
import { UserDto } from "@/common/dto/User.dto"

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
   device: DeviceDto
   request: IssueRequestDto
   fixer: UserDto
}
