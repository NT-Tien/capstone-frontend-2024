import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Tasks_AllFilterAndSort, { Request, Response } from "@/features/admin/api/task/all_withFilterAndSort.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useTask_AllFilteredAndSortedQuery.qk = (props: Props) => ["admin", "task", "all", "filtered-and-sorted", props]
useTask_AllFilteredAndSortedQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useTask_AllFilteredAndSortedQuery.qk(props),
   queryFn: () => Admin_Tasks_AllFilterAndSort(props),
})

function useTask_AllFilteredAndSortedQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useTask_AllFilteredAndSortedQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useTask_AllFilteredAndSortedQuery
