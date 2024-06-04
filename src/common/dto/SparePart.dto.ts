import { MachineModelDto } from "@/common/dto/MachineModel.dto"

export type SparePartDto = {
   machineModel: MachineModelDto
   name: string
   quantity: number
   expirationDate: string
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: null | string
}
