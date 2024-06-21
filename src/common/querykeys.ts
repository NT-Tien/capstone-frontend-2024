import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"

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
      all: () => ["machine-model"],
      all_withDeleted: () => ["machine-model", "all_withDeleted"],
      one_byId: (id: string) => ["machine-model", id],
   },
   devices: {
      all: () => ["devices"],
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
      all: (page: number, limit: number, status: IssueRequestStatus) => ["issue-requests", { page, limit, status }],
      allRaw: () => ["issue-requests"],
      byId: (id: string) => ["issue-requests", id],
   },
}

export default qk
