import { Request as AllApiRequest } from "@/features/admin/api/request/all.api"
import { Task } from "./api/task/all.api"

export const admin_qk = {
   requests: {
      all: (request: AllApiRequest) => ["admin", "requests", "all", request],
   },
   tasks: {
      all: (task: Task) => ["admin", "tasks", "all", task],
   },
   devices: {
      byAreaId: (id: string) => ["admin", "devices", "byAreaId", id],
   },
}
