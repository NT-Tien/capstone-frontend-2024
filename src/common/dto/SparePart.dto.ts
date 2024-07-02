import { MachineModelDto } from "@/common/dto/MachineModel.dto"

export type SparePartDto = {
   id: string
   machineModel: MachineModelDto
   name: string
   quantity: number
   expirationDate: string
   createdAt: string
   updatedAt: string
   deletedAt: null | string
}
