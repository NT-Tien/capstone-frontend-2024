import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { UserDto } from "@/lib/domain/User/User.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { RequestTypeEnum } from "@/lib/domain/Request/RequestType.enum"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { FeedbackDto } from "@/lib/domain/Feedback/Feedback.dto"
import { DeviceWarrantyCardDto } from "@/lib/domain/DeviceWarrantyCard/DeviceWarrantyCard.dto"
import { AreaDto } from "@/lib/domain/Area/Area.dto"

export type RequestDto = {
   id: string
   code: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   requester_note: string
   status: FixRequestStatus
   device: DeviceDto
   old_device: DeviceDto
   requester: UserDto
   tasks: TaskDto[]
   type: RequestTypeEnum
   checker_note: string | null
   checker: UserDto
   checker_date: string
   issues: IssueDto[]
   is_seen: boolean
   is_warranty: boolean
   is_fix: boolean
   is_rennew: boolean
   return_date_warranty: string | null
   feedback?: FeedbackDto[]
   is_multiple_types?: boolean
   is_replacement_device?: boolean
   temporary_replacement_device?: DeviceDto
   deviceWarrantyCards?: DeviceWarrantyCardDto[];
   area: AreaDto
}
