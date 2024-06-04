import { PositionDto } from "@/common/dto/Position.dto"
import { MachineModelDto } from "@/common/dto/MachineModel.dto"

export type DeviceDto = {
   position: PositionDto
   machineModel: MachineModelDto
   description: string
   operationStatus: number
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: null | string
}
