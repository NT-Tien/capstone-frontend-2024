import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_MachineModel_OneById, { Request, Response } from "@/features/admin/api/machine-model/one-byId.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useMachineModel_OneQuery.qk = (props: Props) => ["admin", "machine-model", "one", "id", props]
useMachineModel_OneQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useMachineModel_OneQuery.qk(props),
   queryFn: () => Admin_MachineModel_OneById(props),
})

function useMachineModel_OneQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useMachineModel_OneQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useMachineModel_OneQuery
