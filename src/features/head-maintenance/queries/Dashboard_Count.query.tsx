import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Dashboard_Count, {
   type Request,
   type Response,
} from "@/features/head-maintenance/api/dashboard/count.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useDashboard_Count.qk = (props: Props) => ["head_maintenance", "dashboard", "count", props]
useDashboard_Count.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useDashboard_Count.qk(props),
   queryFn: () => HeadStaff_Dashboard_Count(props),
})

function useDashboard_Count(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useDashboard_Count.queryOptions(props),
      ...queryOptions,
   })
}

export default useDashboard_Count
