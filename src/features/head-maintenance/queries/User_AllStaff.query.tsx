import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Users_AllStaff, { type Request, type Response } from "@/features/head-maintenance/api/users/all.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useUser_AllStaff.qk = (props: Props) => ["head_maintenance", "user", "all-staff", props]
useUser_AllStaff.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useUser_AllStaff.qk(props),
   queryFn: async () => {
      return await HeadStaff_Users_AllStaff({})
   },
})

function useUser_AllStaff(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useUser_AllStaff.queryOptions(props),
      ...queryOptions,
   })
}

export default useUser_AllStaff
