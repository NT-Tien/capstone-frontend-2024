import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { UserDto } from "@/lib/domain/User/User.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { RequestTypeEnum } from "@/lib/domain/Request/RequestType.enum"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"

export type RequestDto = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   requester_note: string
   status: FixRequestStatus
   device: DeviceDto
   requester: UserDto
   tasks: TaskDto[]
   type: RequestTypeEnum
   checker_note: string | null
   checker: UserDto
   checker_date: string
   issues: IssueDto[]
   is_seen: boolean
   is_warranty: boolean
   return_date_warranty: string | null
}
