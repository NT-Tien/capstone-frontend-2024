import { Request as AllApiRequest } from "@/app/admin/_api/requests/all.api"
import { Task } from "./tasks/all.api"

export const admin_qk = {
    requests: {
        all: (request: AllApiRequest) => ["admin", "requests", "all", request],
    },
    tasks: {
        all: (task: Task) => ["admin", "tasks", "all", task],
    },
    devices: {
        byAreaId: (id: string) => ["admin", "devices", "byAreaId", id]
    }
}