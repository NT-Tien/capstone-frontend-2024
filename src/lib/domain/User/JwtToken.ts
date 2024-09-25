import { Role } from "@/lib/domain/User/role.enum"

export type JwtToken = {
   username: string
   phone: string
   exp: number
   role: Role
   id: string
}
