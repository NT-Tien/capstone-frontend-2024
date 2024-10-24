import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { UserDto } from "@/lib/domain/User/User.dto"

export type FeedbackDto = {
   request: RequestDto
   requester: UserDto
   content: string
}
