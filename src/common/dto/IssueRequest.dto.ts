import { DeviceDto } from "@/common/dto/Device.dto"
import { UserDto } from "@/common/dto/User.dto"

export type IssueRequestDto = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   description: string
   status: string
   device: DeviceDto
   account: UserDto
}
