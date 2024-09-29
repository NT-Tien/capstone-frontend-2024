import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Task_OneById, { Request, Response } from "@/features/admin/api/task/one.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useTask_One.qk = (props: Props) => ["admin", "task", "one", "id", props]
useTask_One.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useTask_One.qk(props),
   queryFn: () => Admin_Task_OneById(props),
})

function useTask_One(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useTask_One.queryOptions(props),
      ...queryOptions,
   })
}

export default useTask_One
