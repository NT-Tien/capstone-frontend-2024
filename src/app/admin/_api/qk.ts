import { Request as AllApiRequest } from "@/app/admin/_api/requests/all.api"

export const admin_qk = {
    requests: {
        all: (request: AllApiRequest) => ["admin", "requests", "all", request],
    }
}