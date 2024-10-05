import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Head_Device_OneId, { type Request, type Response } from "@/features/head-department/api/device/one-id"
import generateQueryNotFoundOptions from "@/lib/utils/generateQueryNotFoundOptions.util"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useDevice_OneByIdQuery.qk = (props: Props) => ["head-department", "device", "one-by-id", props]
useDevice_OneByIdQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useDevice_OneByIdQuery.qk(props),
   queryFn: () => Head_Device_OneId(props),
   ...generateQueryNotFoundOptions(),
})

function useDevice_OneByIdQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useDevice_OneByIdQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useDevice_OneByIdQuery
