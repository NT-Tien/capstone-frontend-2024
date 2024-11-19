import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"

export type MachineModelDto = {
   name: string
   description: string
   manufacturer: string
   yearOfProduction: number
   dateOfReceipt: string
   warrantyTerm?: string
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: null | string
   spareParts: SparePartDto[]
   typeErrors: TypeErrorDto[]
   devices: DeviceDto[]
   device_renew: DeviceDto
   image: string
}
