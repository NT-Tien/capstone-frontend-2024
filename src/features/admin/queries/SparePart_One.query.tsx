import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_SpareParts_OneById, { Request, Response } from "../api/spare-part/one-byId.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useSparePart_One.qk = (props: Props) => ["admin", "spare-part", "one", "id", props]
useSparePart_One.queryOptions = (props: Props): QueryOptions => ({
    queryKey: useSparePart_One.qk(props),
    queryFn: () => Admin_SpareParts_OneById(props),
})

function useSparePart_One(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
    return useQuery({
        ...useSparePart_One.queryOptions(props),
        ...queryOptions,
    })
}

export default useSparePart_One