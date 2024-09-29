import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_MachineModel_All, { Response } from "@/features/admin/api/machine-model/all.api"

type Props = {}
type QueryOptions = UseQueryOptions<Response, Error, Response, string[]>

useMachineModel_AllQuery.qk = (props: Props) => ["admin", "machineModel", "all"]
useMachineModel_AllQuery.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useMachineModel_AllQuery.qk(props),
   queryFn: () => Admin_MachineModel_All(props),
})

function useMachineModel_AllQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useMachineModel_AllQuery.queryOptions(props),
      ...queryOptions,
   })
}

export default useMachineModel_AllQuery
