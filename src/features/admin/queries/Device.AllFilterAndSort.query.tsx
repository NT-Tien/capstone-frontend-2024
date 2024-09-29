import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Device_AllWithFilterAndSort, {
   Request,
   Response,
} from "@/features/admin/api/device/all_withFilterAndSort.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useDevice_AllFilteredAndSortedQuery.qk = (props: Props) => ["admin", "device", "all", "filtered-and-sorted", props]
useDevice_AllFilteredAndSortedQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useDevice_AllFilteredAndSortedQuery.qk(props),
   queryFn: () => Admin_Device_AllWithFilterAndSort(props),
})

function useDevice_AllFilteredAndSortedQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useDevice_AllFilteredAndSortedQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useDevice_AllFilteredAndSortedQuery
