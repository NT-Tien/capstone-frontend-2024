import { Role } from "@/common/enum/role.enum"

export type UserDto = {
   role: Role
   username: string
   phone: string
   deletedAt: string | null
   id: string
   createdAt: string
   updatedAt: string
}
