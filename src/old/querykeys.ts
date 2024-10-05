import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"

const qk = {
   users: {
      all: () => ["users"],
      byId: (id: number) => ["users", id],
   },
   areas: {
      all: () => ["areas"],
      one: (id: string) => ["areas", id],
      all_withDeleted: () => ["areas", "all_withDeleted"],
   },
   positions: {
      all: () => ["positions"],
   },
   machineModels: {
      all: () => ["warehouse"],
      all_withDeleted: () => ["warehouse", "all_withDeleted"],
      one_byId: (id: string) => ["warehouse", id],
   },
   devices: {
      all: () => ["admin", "devices"],
      all_withDeleted: () => ["devices", "all_withDeleted"],
      one_byId: (id: string) => ["devices", id],
   },
   spareParts: {
      allRaw: () => ["spare-part"],
      all: (page: number, limit: number, searchName?: string) => ["spare-part", { page, limit, searchName }],
      all_withDeleted: () => ["spare-part", "all_withDeleted"],
      one_byId: (id: string) => ["spare-part", id],
   },
   issueRequests: {
      all: (page: number, limit: number, status: FixRequestStatus) => ["issue-request", { page, limit, status }],
      allRaw: () => ["issue-request"],
      byId: (id: string) => ["issue-request", id],
   },
   task: {
      all: (page?: number, limit?: number, status?: TaskStatus) => ["task", { page, limit, status }],
      one_byId: (id: string) => ["task", id],
   },
}

export default qk
