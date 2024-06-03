import { AreaDto } from "@/common/dto/Area.dto"

export type PositionDto = {
   area: AreaDto
   positionX: number
   positionY: number
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: null | string
}
