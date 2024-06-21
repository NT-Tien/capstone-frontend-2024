import { MachineModelDto } from "@/common/dto/MachineModel.dto"
import { AreaDto } from "@/common/dto/Area.dto"

export type DeviceDto = {
   machineModel: MachineModelDto
   area: AreaDto
   description: string
   operationStatus: number
   positionX: number
   positionY: number
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: null | string
}
