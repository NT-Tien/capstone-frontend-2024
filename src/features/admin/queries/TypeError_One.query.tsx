import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_TypeError_OneById, { Request, Response } from "../api/type-error/one-byId.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useTypeError_One.qk = (props: Props) => ["admin", "type-error", "one", "id", props]
useTypeError_One.queryOptions = (props: Props): QueryOptions => ({
    queryKey: useTypeError_One.qk(props),
    queryFn: () => Admin_TypeError_OneById(props)
})

function useTypeError_One(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useTypeError_One.queryOptions(props),
      ...queryOptions,
   })
}

export default useTypeError_One