import { UserDto } from "@/lib/domain/User/User.dto"
import { Role } from "@/lib/domain/User/role.enum"

export type NotificationDto = {
   fromUser: UserDto
   receiver: UserDto
   roleReceiver: Role
   subjectId?: string
   type?: string
   content: any
   seen: boolean
   identifier: string
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
}
