import { TypeErrorDto } from "@/common/dto/TypeError.dto"
import { SparePartDto } from "@/common/dto/SparePart.dto"

export type TaskIssueDto = {
   description: string
   fixType: string
   status: string
   deletedAt: string | null
   id: string
   createdAt: string
   updatedAt: string
   typeError: TypeErrorDto
   issueSpareParts: SparePartDto[]
}
