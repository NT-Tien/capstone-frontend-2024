import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { ExportType } from "@/lib/domain/ExportWarehouse/ExportType.enum"
import { ExportStatus } from "@/lib/domain/ExportWarehouse/ExportStatus.enum"

export type ExportWarehouseDto = {
   task: TaskDto
   detail: any
   export_type: ExportType
   status: ExportStatus
   reason_cancel: string
}
