import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Staff_Task_AllCounts, { Request, Response } from "@/features/staff/api/task/all-counts.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useTask_AllCounts.qk = (props: Props) => ["staff", "task", "all-counts", props]
useTask_AllCounts.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useTask_AllCounts.qk(props),
   queryFn: () => Staff_Task_AllCounts(props),
})

function useTask_AllCounts(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useTask_AllCounts.queryOptions(props),
      ...queryOptions,
   })
}

export default useTask_AllCounts
