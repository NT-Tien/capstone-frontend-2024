import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { AreaDto } from "@/lib/domain/Area/Area.dto"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

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
   requests: RequestDto[]
}
