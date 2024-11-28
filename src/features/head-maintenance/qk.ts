import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

const headstaff_qk = {
   dashboard: {
      count: () => ["headstaff", "dashboard", "count"],
   },
   request: {
      base: () => ["headstaff", "request"],
      all: (props?: { page: number; limit: number; status: FixRequestStatus }) => [
         "headstaff",
         "request",
         "all",
         props,
      ],
      byId: (id: string) => ["headstaff", "request", "byId", id],
      renewStatus: (id: string) => ["headstaff", "request", "renewStatus", id]
   },
   task: {
      base: () => ["headstaff", "task"],
      all: (props: { page: string; limit: string; status: string }) => ["headstaff", "task", "all", props],
      byId: (id: string) => ["headstaff", "task", "byId", id],
   },
   device: {
      byId: (id: string) => ["headstaff", "device", "byId", id],
      byIdWithHistory: (id: string) => ["headstaff", "device", id, "byIdWithHistory"],
   },
   issue: {
      byId: (id: string) => ["headstaff", "issue", "byId", id],
   },
   user: {
      all: () => ["headstaff", "user", "all"],
   },
   typeError: {
      common: () => ["headstaff", "typeError", "common"],
   },
}

export default headstaff_qk
