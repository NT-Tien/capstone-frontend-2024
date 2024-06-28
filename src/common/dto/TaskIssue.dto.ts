import { TypeErrorDto } from "@/common/dto/TypeError.dto"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import { IssueSparePartDto } from "@/common/dto/IssueSparePart.dto"
import { FixType } from "../enum/fix-type.enum"

export type TaskIssueDto = {
   description: string
   fixType: FixType
   status: string
   deletedAt: string | null
   id: string
   createdAt: string
   updatedAt: string
   typeError: TypeErrorDto
   issueSpareParts: IssueSparePartDto[]
}
