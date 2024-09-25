import { Role } from "@/lib/domain/User/role.enum"
import { TaskDto } from "@/lib/domain/Task/Task.dto"

export type UserDto = {
   role: Role | null
   username: string
   phone: string
   deletedAt: string | null
   id: string
   createdAt: string
   updatedAt: string
   tasks: TaskDto[]
}
