import Staff_Task_AllInProgress, { Request, Response } from "@/features/staff/api/task/all-in-progress.api"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useTask_All_InProgress.qk = (props: Props) => ["staff", "task", "all-in-progress", props]
useTask_All_InProgress.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useTask_All_InProgress.qk(props),
   queryFn: () => Staff_Task_AllInProgress(props),
})

function useTask_All_InProgress(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useTask_All_InProgress.queryOptions(props),
      ...queryOptions,
   })
}

export default useTask_All_InProgress
