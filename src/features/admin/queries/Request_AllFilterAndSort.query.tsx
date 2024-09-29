import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Requests_AllWithFilterAndSort, {
   Request,
   Response,
} from "@/features/admin/api/request/all_withFilterAndSort.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useRequest_AllFilteredAndSortedQuery.qk = (props: Props) => ["admin", "request", "all", "filtered-and-sorted", props]
useRequest_AllFilteredAndSortedQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useRequest_AllFilteredAndSortedQuery.qk(props),
   queryFn: () => Admin_Requests_AllWithFilterAndSort(props),
})

function useRequest_AllFilteredAndSortedQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useRequest_AllFilteredAndSortedQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useRequest_AllFilteredAndSortedQuery
