import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Head_Notifications, { Request, Response } from "@/features/head-department/api/notifications.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useNotifications_All.qk = (props: Props) => ["head_department", "notifications", "all", props]
useNotifications_All.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useNotifications_All.qk(props),
   queryFn: () => Head_Notifications(props),
})

function useNotifications_All(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useNotifications_All.queryOptions(props),
      ...queryOptions,
   })
}

export default useNotifications_All