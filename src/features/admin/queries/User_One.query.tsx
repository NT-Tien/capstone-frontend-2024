import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_User_OneById, { Request, Response } from "@/features/admin/api/user/one.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useUser_One.qk = (props: Props) => ["admin", "user", "one", "id", props]
useUser_One.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useUser_One.qk(props),
   queryFn: () => Admin_User_OneById(props),
})

function useUser_One(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useUser_One.queryOptions(props),
      ...queryOptions,
   })
}

export default useUser_One
