import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Tasks_AllFilterAndSort, {
    Request,
    Response,
 } from "../api/task/all_withFilterAndSort.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Request)[]>

useTypeError_AllFilterAndSortedQuery.qk = (props: Props) => ["admin", "typeError", "all", "filtered-and-sorted", props]
useTypeError_AllFilterAndSortedQuery.queryOptions = (props: Props): QueryOptions => ({
    queryKey: useTypeError_AllFilterAndSortedQuery.qk(props),
    queryFn: () => Admin_Tasks_AllFilterAndSort(props),
})

function useTypeError_AllFilterAndSortedQuery(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
    return useQuery({
        ...useTypeError_AllFilterAndSortedQuery.queryOptions(props),
        ...queryOptions,
    })
}

export default useTypeError_AllFilterAndSortedQuery