import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Staff_Task_AllByDate, { Request, Response } from "@/features/staff/api/task/all-by-date.api"
import dayjs from "dayjs"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useTask_AllByDate.qk = (props: Props) => ["staff", "task", "all-by-date", props]
useTask_AllByDate.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useTask_AllByDate.qk(props),
   queryFn: () => Staff_Task_AllByDate(props),
})

function useTask_AllByDate(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useTask_AllByDate.queryOptions(props),
      ...queryOptions,
   })
}

export default useTask_AllByDate
