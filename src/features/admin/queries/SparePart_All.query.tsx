import { UseQueryOptions, useQuery } from "@tanstack/react-query"
import Admin_SpareParts_All, { Response, Request } from "../api/spare-part/all.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useSparePart_AllQuery.qk = (props: Props) => ["admin", "sparePart", "all", props]
useSparePart_AllQuery.queryOptions = (props: Props): QueryOptions => ({
    queryKey: useSparePart_AllQuery.qk(props),
    queryFn: () => Admin_SpareParts_All(props)
})
function useSparePart_AllQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
    return useQuery({
        ...useSparePart_AllQuery.queryOptions(props),
        ...queryOptions,
    })
}

export default useSparePart_AllQuery