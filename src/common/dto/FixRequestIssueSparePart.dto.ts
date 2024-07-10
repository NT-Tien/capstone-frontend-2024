import { SparePartDto } from "@/common/dto/SparePart.dto"

export type FixRequestIssueSparePartDto = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   quantity: number
   status: string
   note: string | null
   sparePart: SparePartDto
}
