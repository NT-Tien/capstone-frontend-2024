import Head_Request_All, { type Request, type Response } from "@/features/head-department/api/request/all.api"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, string[]>

useRequest_AllQuery.qk = (req: Props) => ["head-department", "request", "all"]
useRequest_AllQuery.queryOptions = (req: Props): QueryOptions => ({
   queryKey: useRequest_AllQuery.qk(req),
   queryFn: () => Head_Request_All(req),
})

function useRequest_AllQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useRequest_AllQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useRequest_AllQuery
