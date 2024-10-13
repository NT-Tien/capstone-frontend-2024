import { DeviceDto } from "@/lib/domain/Device/Device.dto"

export type AreaDto = {
   name: string
   instruction: string
   width: number
   height: number
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   devices: DeviceDto[]
}
