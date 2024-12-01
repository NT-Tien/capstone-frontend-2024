import { FeedbackRating } from "@/lib/domain/Feedback/FeedbackRating.enum"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { UserDto } from "@/lib/domain/User/User.dto"

export type FeedbackDto = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   request: RequestDto
   requester: UserDto
   content: string
   rating: FeedbackRating
}
