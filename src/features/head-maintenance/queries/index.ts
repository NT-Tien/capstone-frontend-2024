import useDevice_AllNoPosition from "@/features/head-maintenance/queries/Device_AllNoPosition.query"
import useRequest_OneQuery from "@/features/head-maintenance/queries/Request_One.query"
import useDevice_OneQuery from "@/features/head-maintenance/queries/Device_One.query"
import useDevice_AllRequestHistoryQuery from "@/features/head-maintenance/queries/Device_AllRequestHistory.query"

const head_maintenance_queries = {
   device: {
      all_noPosition: useDevice_AllNoPosition,
      one: useDevice_OneQuery,
      all_requestHistory: useDevice_AllRequestHistoryQuery,
   },
   request: {
      one: useRequest_OneQuery,
   },
}

export default head_maintenance_queries
