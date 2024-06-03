import { Role } from "@/common/enum/role.enum"

export type JwtToken = {
   username: string
   exp: number
   role: Role
}
