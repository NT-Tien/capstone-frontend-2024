import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_SpareParts_All, {
    Request,
    Response,
 } from "../api/spare-part/all.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useSparePart_AllFilterAndSortedQuery.qk = (props: Props) => ["admin", "sparePart", "all", "filtered-and-sorted", props]
useSparePart_AllFilterAndSortedQuery.queryOptions = (props: Props): QueryOptions => ({
    queryKey: useSparePart_AllFilterAndSortedQuery.qk(props),
    queryFn: () => Admin_SpareParts_All(props),
})
function useSparePart_AllFilterAndSortedQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
    return useQuery({
        ...useSparePart_AllFilterAndSortedQuery.queryOptions(props),
        ...queryOptions,
    })
}

export default useSparePart_AllFilterAndSortedQuery