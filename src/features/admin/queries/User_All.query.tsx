import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Users_All, { Request, Response } from "@/features/admin/api/user/all.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, string[]>

useUser_AllQuery.qk = (props: Props) => ["admin", "users", "all"]
useUser_AllQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useUser_AllQuery.qk(props),
   queryFn: () => Admin_Users_All(),
})

function useUser_AllQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useUser_AllQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useUser_AllQuery
