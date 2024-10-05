import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Head_Device_OneId_WithRequests, {
   type Response,
   type Request,
} from "@/features/head-department/api/device/one-id_with-requests"
import generateQueryNotFoundOptions from "@/lib/utils/generateQueryNotFoundOptions.util"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useDevice_OneById_WithRequestsQuery.qk = (props: Props) => [
   "head-department",
   "device",
   "one-by-id",
   "with-request",
   props,
]
useDevice_OneById_WithRequestsQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useDevice_OneById_WithRequestsQuery.qk(props),
   queryFn: () => Head_Device_OneId_WithRequests(props),
   ...generateQueryNotFoundOptions(),
})

function useDevice_OneById_WithRequestsQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useDevice_OneById_WithRequestsQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useDevice_OneById_WithRequestsQuery
