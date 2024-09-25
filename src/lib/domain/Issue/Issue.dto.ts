import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"
import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { FixType } from "@/lib/domain/Issue/FixType.enum"

export type IssueDto = {
   description: string
   fixType: FixType
   status: IssueStatusEnum
   deletedAt: string | null
   id: string
   createdAt: string
   updatedAt: string
   typeError: TypeErrorDto
   issueSpareParts: IssueSparePartDto[]
   task: TaskDto
   imagesVerify: string[]
   videosVerify: string
}
