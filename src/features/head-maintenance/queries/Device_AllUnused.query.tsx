import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Device_AllUnused, { Request, Response } from "@/features/head-maintenance/api/device/all_unUsed.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, string[]>

useDevice_AllUnused.qk = (props: Props) => ["head_maintenance", "device", "all", "unused"]
useDevice_AllUnused.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useDevice_AllUnused.qk(props),
   queryFn: () => HeadStaff_Device_AllUnused({}),
})

function useDevice_AllUnused(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useDevice_AllUnused.queryOptions(props),
      ...queryOptions,
   })
}

export default useDevice_AllUnused
