import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Request_All30Days, { Request, Response } from "@/features/head-maintenance/api/request/all30Days.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useRequest_All.qk = (props: Props) => ["head_maintenance", "request", "all", props]
useRequest_All.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useRequest_All.qk(props),
   queryFn: () => HeadStaff_Request_All30Days(props),
})

function useRequest_All(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useRequest_All.queryOptions(props),
      ...queryOptions,
   })
}

export default useRequest_All
