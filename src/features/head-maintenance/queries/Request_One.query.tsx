import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Request_OneById, {
   type Request,
   type Response,
} from "@/features/head-maintenance/api/request/oneById.api"
import generateQueryNotFoundOptions from "@/lib/utils/generateQueryNotFoundOptions.util"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useRequest_OneQuery.qk = (props: Props) => ["head_maintenance", "request", "one", props]
useRequest_OneQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useRequest_OneQuery.qk(props),
   queryFn: () => HeadStaff_Request_OneById(props),
   ...generateQueryNotFoundOptions(),
})

function useRequest_OneQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useRequest_OneQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useRequest_OneQuery
