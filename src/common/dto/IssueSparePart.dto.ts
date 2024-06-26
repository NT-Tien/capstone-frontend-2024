import { SparePartDto } from "@/common/dto/SparePart.dto"

export type IssueSparePartDto = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   quantity: number
   status: string
   note: string | null
   sparePart: SparePartDto
}
