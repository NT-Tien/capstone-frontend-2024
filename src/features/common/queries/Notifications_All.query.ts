import Notifications_All, { type Request, type Response } from "@/features/common/api/notifications/all.api"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useNotifications_All.qk = (req: Props) => ["global", "notifications", "all", req]
useNotifications_All.queryOptions = (req: Props): QueryOptions => ({
   queryKey: useNotifications_All.qk(req),
   queryFn: () => Notifications_All(req),
})

function useNotifications_All(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useNotifications_All.queryOptions(props),
      ...queryOptions,
   })
}

export default useNotifications_All
