import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Request_Statistics, {
   type Request,
   type Response,
} from "@/features/head-maintenance/api/request/statistics.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useRequest_Statistics.qk = (props: Props) => ["head_maintenance", "request", "statistics", props]
useRequest_Statistics.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useRequest_Statistics.qk(props),
   queryFn: () => HeadStaff_Request_Statistics({}),
})

function useRequest_Statistics(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useRequest_Statistics.queryOptions(props),
      ...queryOptions,
   })
}

export default useRequest_Statistics
