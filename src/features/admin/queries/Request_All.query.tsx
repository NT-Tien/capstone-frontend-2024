import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Requests_All, { Request, Response } from "@/features/admin/api/request/all.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useRequest_AllQuery.qk = (props: Props) => ["admin", "request", "all", props]
useRequest_AllQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useRequest_AllQuery.qk(props),
   queryFn: () => Admin_Requests_All({ page: props.page, time: props.time, limit: props.limit, status: props.status }),
})

function useRequest_AllQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useRequest_AllQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useRequest_AllQuery
