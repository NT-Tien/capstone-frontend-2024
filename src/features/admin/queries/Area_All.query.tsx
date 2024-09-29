import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Areas_All, { Request, Response } from "@/features/admin/api/area/all.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useArea_AllQuery.qk = (props: Props) => ["admin", "area", "all", props]
useArea_AllQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useArea_AllQuery.qk(props),
   queryFn: () => Admin_Areas_All(),
})

function useArea_AllQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useArea_AllQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useArea_AllQuery
