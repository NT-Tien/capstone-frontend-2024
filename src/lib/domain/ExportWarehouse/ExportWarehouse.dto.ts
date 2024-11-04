import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { ExportType } from "@/lib/domain/ExportWarehouse/ExportType.enum"
import { ExportStatus } from "@/lib/domain/ExportWarehouse/ExportStatus.enum"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"

export type ExportWarehouseDto = {
   task: TaskDto
   detail: IssueDto[]
   export_type: ExportType
   status: ExportStatus
   reason_cancel: string
   reason_delay: string
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
}
