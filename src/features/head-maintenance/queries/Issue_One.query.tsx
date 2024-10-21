import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import generateQueryNotFoundOptions from "@/lib/utils/generateQueryNotFoundOptions.util"
import HeadStaff_Issue_OneById, { Request, Response } from "@/features/head-maintenance/api/issue/oneById.api"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useIssue_One.qk = (props: Props) => ["head_maintenance", "issue", "one", props]
useIssue_One.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useIssue_One.qk(props),
   queryFn: () => HeadStaff_Issue_OneById(props),
   ...generateQueryNotFoundOptions(),
})

function useIssue_One(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useIssue_One.queryOptions(props),
      ...queryOptions,
   })
}

export default useIssue_One
