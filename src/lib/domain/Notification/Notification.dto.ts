import { NotificationPriority } from "@/lib/domain/Notification/NotificationPriority.enum"
import { NotificationType } from "@/lib/domain/Notification/NotificationType.enum"
import { UserDto } from "@/lib/domain/User/User.dto"

export type NotificationDto = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   sender?: UserDto
   receiver: UserDto
   title: string
   body: string
   priority: NotificationPriority
   seenDate: string
   type: NotificationType
   subject?: string
   data: any
}
