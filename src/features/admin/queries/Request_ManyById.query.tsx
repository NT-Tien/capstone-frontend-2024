import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Requests_ManyByIds, { Request, Response } from "@/features/admin/api/request/many-by-ids.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useRequest_ManyByIdQuery.qk = (props: Props) => ["admin", "request", "many-by-id", props]
useRequest_ManyByIdQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useRequest_ManyByIdQuery.qk(props),
   queryFn: () => Admin_Requests_ManyByIds(props),
})

function useRequest_ManyByIdQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useRequest_ManyByIdQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useRequest_ManyByIdQuery
