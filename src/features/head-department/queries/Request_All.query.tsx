import Head_Request_All, { type Response } from "@/features/head-department/api/request/all.api"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

useRequest_AllQuery.qk = () => ["head-department", "request", "all"]
useRequest_AllQuery.queryOptions = (): UseQueryOptions<Response, Error, Response, string[]> => ({
   queryKey: useRequest_AllQuery.qk(),
   queryFn: Head_Request_All,
})

export default function useRequest_AllQuery() {
   return useQuery(useRequest_AllQuery.queryOptions())
}
