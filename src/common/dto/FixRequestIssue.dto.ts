import { TypeErrorDto } from "@/common/dto/TypeError.dto"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import { FixRequestIssueSparePartDto } from "@/common/dto/FixRequestIssueSparePart.dto"
import { FixType } from "../enum/fix-type.enum"
import { TaskDto } from "@/common/dto/Task.dto"

export type FixRequestIssueDto = {
   description: string
   fixType: FixType
   status: string
   deletedAt: string | null
   id: string
   createdAt: string
   updatedAt: string
   typeError: TypeErrorDto
   issueSpareParts: FixRequestIssueSparePartDto[]
   task: TaskDto
}
