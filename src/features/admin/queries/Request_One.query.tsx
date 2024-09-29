import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Request_OneById, { Request, Response } from "@/features/admin/api/request/one.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useRequest_One.qk = (props: Props) => ["admin", "request", "one", "id", props]
useRequest_One.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useRequest_One.qk(props),
   queryFn: () => Admin_Request_OneById(props),
})

function useRequest_One(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useRequest_One.queryOptions(props),
      ...queryOptions,
   })
}

export default useRequest_One
