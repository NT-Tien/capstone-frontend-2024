import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Device_CheckKey, { Request, Response } from "@/features/head-maintenance/api/device/checkKey.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useDevice_CheckKey.qk = (props: Props) => ["head_maintenance", "device", "checkkey", props]
useDevice_CheckKey.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useDevice_CheckKey.qk(props),
   queryFn: () => HeadStaff_Device_CheckKey(props),
})

function useDevice_CheckKey(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useDevice_CheckKey.queryOptions(props),
      ...queryOptions,
   })
}

export default useDevice_CheckKey
