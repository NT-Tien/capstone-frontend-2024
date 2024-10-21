import useDevice_AllNoPosition from "@/features/head-maintenance/queries/Device_AllNoPosition.query"
import useRequest_OneQuery from "@/features/head-maintenance/queries/Request_One.query"
import useDevice_OneQuery from "@/features/head-maintenance/queries/Device_One.query"
import useDevice_AllRequestHistoryQuery from "@/features/head-maintenance/queries/Device_AllRequestHistory.query"
import useDashboard_Count from "@/features/head-maintenance/queries/Dashboard_Count.query"
import useRequest_Statistics from "@/features/head-maintenance/queries/Request_Statistics.query"
import useTypeError_Common from "@/features/head-maintenance/queries/TypeError_Common.query"
import useIssue_One from "@/features/head-maintenance/queries/Issue_One.query"

const head_maintenance_queries = {
   device: {
      all_noPosition: useDevice_AllNoPosition,
      one: useDevice_OneQuery,
      all_requestHistory: useDevice_AllRequestHistoryQuery,
   },
   request: {
      one: useRequest_OneQuery,
      statistics: useRequest_Statistics,
   },
   dashboard: {
      count: useDashboard_Count,
   },
   typeError: {
      common: useTypeError_Common,
   },
   issue: {
      one: useIssue_One,
   },
}

export default head_maintenance_queries
