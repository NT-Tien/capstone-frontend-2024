import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Notifications, { Request, Response } from "@/features/head-maintenance/api/notifications.api"
import Staff_Notifications from "@/features/staff/api/notifications.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useNotifications_All.qk = (props: Props) => ["staff", "notifications", "all", props]
useNotifications_All.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useNotifications_All.qk(props),
   queryFn: () => Staff_Notifications(props),
})

function useNotifications_All(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useNotifications_All.queryOptions(props),
      ...queryOptions,
   })
}

export default useNotifications_All
