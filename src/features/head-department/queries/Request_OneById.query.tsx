import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Head_Request_OneById, { type Response, type Request } from "@/features/head-department/api/request/one-id.api"
import generateQueryNotFoundOptions from "@/lib/utils/generateQueryNotFoundOptions.util"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useRequest_OneByIdQuery.qk = (props: Props) => ["head-department", "request", "one-by-id", props]
useRequest_OneByIdQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useRequest_OneByIdQuery.qk(props),
   queryFn: () => Head_Request_OneById(props),
   retry: 10,
   ...generateQueryNotFoundOptions(),
})

function useRequest_OneByIdQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useRequest_OneByIdQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useRequest_OneByIdQuery
