import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Device_OneByIdWithHistory, {
   type Request,
   type Response,
} from "@/features/head-maintenance/api/device/one-byIdWithHistory.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useDevice_AllRequestHistoryQuery.qk = (props: Props) => ["head_maintenance", "device", "all-request-history", props]
useDevice_AllRequestHistoryQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useDevice_AllRequestHistoryQuery.qk(props),
   queryFn: () => HeadStaff_Device_OneByIdWithHistory(props),
})

function useDevice_AllRequestHistoryQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useDevice_AllRequestHistoryQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useDevice_AllRequestHistoryQuery
