import { DeviceDto } from "@/common/dto/Device.dto"
import { UserDto } from "@/common/dto/User.dto"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { TaskDto } from "@/common/dto/Task.dto"
import { RequestType } from "@/common/enum/request-type.enum"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"

export type FixRequestDto = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   requester_note: string
   status: FixRequestStatus
   device: DeviceDto
   requester: UserDto
   tasks: TaskDto[]
   type: RequestType
   checker_note: string | null
   checker: UserDto
   checker_date: string
   issues: FixRequestIssueDto[]
   is_seen: boolean
   is_warranty: boolean
   return_date_warranty: string | null
}
