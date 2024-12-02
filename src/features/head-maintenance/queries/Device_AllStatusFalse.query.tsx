import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_Device_AllStatusFalse, { Request, Response }  from "../api/device/all_statusFalse.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, string[]>

useDevice_AllStatusFalse.qk = (props: Props) => ["head_maintenance", "device", "all", "status-false"]
useDevice_AllStatusFalse.queryOptions = (props: Props): QueryOptions => ({
    queryKey: useDevice_AllStatusFalse.qk(props),
    queryFn: () => HeadStaff_Device_AllStatusFalse({})
})

function useDevice_AllStatusFalse(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
    return useQuery({
        ...useDevice_AllStatusFalse.queryOptions(props),
        ...queryOptions,
    })
}

export default useDevice_AllStatusFalse