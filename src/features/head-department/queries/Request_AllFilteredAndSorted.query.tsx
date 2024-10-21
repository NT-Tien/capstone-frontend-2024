import Head_Request_All, { type Request, type Response } from "@/features/head-department/api/request/all.api"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, string[]>

useRequest_AllFilteredAndSortedQuery.qk = (req: Props) => ["head-department", "request", "allFiltered-and-sorted"]
useRequest_AllFilteredAndSortedQuery.queryOptions = (req: Props): QueryOptions => ({
   queryKey: useRequest_AllFilteredAndSortedQuery.qk(req),
   queryFn: () => Head_Request_All(req),
})

function useRequest_AllFilteredAndSortedQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useRequest_AllFilteredAndSortedQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useRequest_AllFilteredAndSortedQuery
