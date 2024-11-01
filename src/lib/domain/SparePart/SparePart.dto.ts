import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"

export type SparePartDto = {
   id: string
   machineModel: MachineModelDto
   name: string
   quantity: number
   expirationDate: string
   createdAt: string
   updatedAt: string
   deletedAt: null | string
   image: string[]
}
