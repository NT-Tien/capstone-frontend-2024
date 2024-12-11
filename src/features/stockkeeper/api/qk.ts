import { Request as AllRequest_SparePart } from "./spare-part/all.api"
import { Request as AllRequest_Task } from "./task/all-search.api"

export const stockkeeper_qk = {
   tasks: {
      base: ["stockkeeper", "tasks"],
      all: (props: { page: number; limit: number }) => [...stockkeeper_qk.tasks.base, "all", props],
      allSearch: (props: AllRequest_Task) => [...stockkeeper_qk.tasks.base, "all-search", props],
      one_byId: (id: string) => ["stockkeeper", "tasks", "one_byId", id],
   },
   sparePart: {
      base: ["stockkeeper", "spare-part"],
      all: (props: AllRequest_SparePart) => [...stockkeeper_qk.sparePart.base, "all", props],
      allNeedMore: () => [...stockkeeper_qk.sparePart.base, "all-need-more"],
   },
   machineModel: {
      base: ["stockkeeper", "machine-model"],
      all: ["stockkeeper", "machine-model", "all"],
      one_byId: (id: string) => ["stockkeeper", "machine-model", "one_byId", id,]
   },
}
