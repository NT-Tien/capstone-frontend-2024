import useRequest_AllQuery from "@/features/head-department/queries/Request_All.query"
import useRequest_OneByIdQuery from "@/features/head-department/queries/Request_OneById.query"
import useDevice_OneByIdQuery from "@/features/head-department/queries/Device_OneById.query"
import useDevice_OneById_WithRequestsQuery from "@/features/head-department/queries/Device_OneById_WithRequests.query"

const head_department_queries = {
   request: {
      all: useRequest_AllQuery,
      oneById: useRequest_OneByIdQuery,
   },
   device: {
      oneById: useDevice_OneByIdQuery,
      oneById_withRequests: useDevice_OneById_WithRequestsQuery,
   },
}

export default head_department_queries
