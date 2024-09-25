import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

const staff_qk = {
   task: {
      base: () => ["staff", "task"],
      all: (props?: { page: string; limit: string; status: FixRequestStatus }) => ["staff", "task", "all", props],
      all_withPriorityFilter: (priority?: boolean) => ["staff", "task", "all", { priority }],
      one_byId: (id: string) => ["staff", "task", { id }],
   },
}

export default staff_qk
