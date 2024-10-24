import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"

export type IssueSparePartDto = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   quantity: number
   note: string | null
   sparePart: SparePartDto
   issue?: IssueDto
}
