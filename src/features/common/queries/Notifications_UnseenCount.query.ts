import Notifications_UnseenCount, { Request, Response } from "@/features/common/api/notifications/unseen-count.api"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, string[]>

useNotifications_UnseenCount.qk = (req: Props) => ["global", "notifications", "unseen"]
useNotifications_UnseenCount.queryOptions = (req: Props): QueryOptions => ({
   queryKey: useNotifications_UnseenCount.qk(req),
   queryFn: () => Notifications_UnseenCount(req),
})

function useNotifications_UnseenCount(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useNotifications_UnseenCount.queryOptions(props),
      ...queryOptions,
   })
}

export default useNotifications_UnseenCount
