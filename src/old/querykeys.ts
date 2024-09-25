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
      allRaw: () => ["spare-parts"],
      all: (page: number, limit: number, searchName?: string) => ["spare-parts", { page, limit, searchName }],
      all_withDeleted: () => ["spare-parts", "all_withDeleted"],
      one_byId: (id: string) => ["spare-parts", id],
   },
   issueRequests: {
      all: (page: number, limit: number, status: FixRequestStatus) => ["issue-requests", { page, limit, status }],
      allRaw: () => ["issue-requests"],
      byId: (id: string) => ["issue-requests", id],
   },
   task: {
      all: (page?: number, limit?: number, status?: TaskStatus) => ["task", { page, limit, status }],
      one_byId: (id: string) => ["task", id],
   },
}

export default qk
