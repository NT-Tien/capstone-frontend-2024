import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Staff_Task_All, { Request, Response } from "@/features/staff/api/task/all.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, string[]>

useTask_All.qk = (props: Props) => ["staff", "task", "all"]
useTask_All.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useTask_All.qk(props),
   queryFn: () => Staff_Task_All(),
})

function useTask_All(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useTask_All.queryOptions(props),
      ...queryOptions,
   })
}

export default useTask_All
