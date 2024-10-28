import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import generateQueryNotFoundOptions from "@/lib/utils/generateQueryNotFoundOptions.util"
import Staff_Task_OneById, { type Request, type Response } from "@/features/staff/api/task/one-byId.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useTask_OneById.qk = (props: Props) => ["staff", "task", "one-by-id", props]
useTask_OneById.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useTask_OneById.qk(props),
   queryFn: () => Staff_Task_OneById(props),
   ...generateQueryNotFoundOptions(),
})

function useTask_OneById(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useTask_OneById.queryOptions(props),
      ...queryOptions,
   })
}

export default useTask_OneById
