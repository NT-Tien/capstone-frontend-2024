import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Areas_OneById, { Request, Response } from "@/features/admin/api/area/one-byId.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useArea_One.qk = (props: Props) => ["admin", "area", "one", "id", props]
useArea_One.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useArea_One.qk(props),
   queryFn: () => Admin_Areas_OneById(props),
})

function useArea_One(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useArea_One.queryOptions(props),
      ...queryOptions,
   })
}

export default useArea_One
