import { TypeErrorDto } from "@/common/dto/TypeError.dto"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import { FixRequestIssueSparePartDto } from "@/common/dto/FixRequestIssueSparePart.dto"
import { FixType } from "../enum/fix-type.enum"
import { TaskDto } from "@/common/dto/Task.dto"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"

export type FixRequestIssueDto = {
   description: string
   fixType: FixType
   status: IssueStatusEnum
   deletedAt: string | null
   id: string
   createdAt: string
   updatedAt: string
   typeError: TypeErrorDto
   issueSpareParts: FixRequestIssueSparePartDto[]
   task: TaskDto
}
