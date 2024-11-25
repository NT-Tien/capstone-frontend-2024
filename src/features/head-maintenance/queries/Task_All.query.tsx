import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Task_All, { Request, Response } from "../api/task/all.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useTask_All.qk = (props: Props) => ["head-maintenance", "task", "all", props]
useTask_All.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useTask_All.qk(props),
   queryFn: () => HeadStaff_Task_All(props),
})

function useTask_All(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useTask_All.queryOptions(props),
      ...queryOptions,
   })
}

export default useTask_All
