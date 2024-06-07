import { Role } from "@/common/enum/role.enum"

export type UserDto = {
   role: Role | null
   username: string
   phone: string
   deletedAt: string | null
   id: string
   createdAt: string
   updatedAt: string
}
