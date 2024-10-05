import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Devices_OneById, { Request, Response } from "@/features/admin/api/device/one-byId.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useDevice_One.qk = (props: Props) => ["admin", "device", "one", "id", props]
useDevice_One.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useDevice_One.qk(props),
   queryFn: () => Admin_Devices_OneById(props),
})

function useDevice_One(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useDevice_One.queryOptions(props),
      ...queryOptions,
   })
}

export default useDevice_One
