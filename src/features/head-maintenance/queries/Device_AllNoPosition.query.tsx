import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Device_AllNoPosition, {
   Request,
   Response,
} from "@/features/head-maintenance/api/device/all_noPosition.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, string[]>

useDevice_AllNoPosition.qk = (props: Props) => ["head_maintenance", "device", "all", "no-position"]
useDevice_AllNoPosition.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useDevice_AllNoPosition.qk(props),
   queryFn: () => HeadStaff_Device_AllNoPosition({}),
})

function useDevice_AllNoPosition(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useDevice_AllNoPosition.queryOptions(props),
      ...queryOptions,
   })
}

export default useDevice_AllNoPosition
