import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Device_OneById, {
   type Request,
   type Response,
} from "@/features/head-maintenance/api/device/one-byId.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useDevice_OneQuery.qk = (props: Props) => ["head_maintenance", "device", "one", props]
useDevice_OneQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useDevice_OneQuery.qk(props),
   queryFn: () => HeadStaff_Device_OneById(props),
})

function useDevice_OneQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useDevice_OneQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useDevice_OneQuery
