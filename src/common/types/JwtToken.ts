import { Role } from "@/common/enum/role.enum"

export type JwtToken = {
   username: string
   phone: string
   exp: number
   role: Role
   id: string
}
