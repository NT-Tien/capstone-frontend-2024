import { UndefinedInitialDataOptions, useQuery, UseQueryOptions } from "@tanstack/react-query"
import Head_Request_OneById from "@/features/head-department/api/request/one-id.api"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import generateQueryNotFoundOptions from "@/lib/utils/generateQueryNotFoundOptions.util"

type Props = {
   requestId: string | null
}

useRequest_OneByIdQuery.qk = (props: Props) => ["head-department", "request", "one-by-id", props.requestId]
useRequest_OneByIdQuery.queryOptions = (
   props: Props,
): UseQueryOptions<RequestDto, Error, RequestDto, (string | null)[]> => ({
   queryKey: useRequest_OneByIdQuery.qk(props),
   queryFn: () => Head_Request_OneById({ id: props.requestId ?? "" }),
   enabled: !!props.requestId,
   ...generateQueryNotFoundOptions(),
})

export default function useRequest_OneByIdQuery(props: Props) {
   return useQuery(useRequest_OneByIdQuery.queryOptions(props))
}
