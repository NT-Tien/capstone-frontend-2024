import { DeviceDto } from "@/common/dto/Device.dto"
import { UserDto } from "@/common/dto/User.dto"
import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"
import { TaskDto } from "@/common/dto/Task.dto"
import { RequestType } from "@/common/enum/request-type.enum"

export type IssueRequestDto = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   requester_note: string
   status: IssueRequestStatus
   device: DeviceDto
   requester: UserDto
   tasks: TaskDto[]
   type: RequestType
   checker_note: string | null
   checker: UserDto
}
