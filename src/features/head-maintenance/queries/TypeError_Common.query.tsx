import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import HeadStaff_TypeError_Common, {
   type Request,
   type Response,
} from "@/features/head-maintenance/api/type-error/common.api"
import { SystemTypeErrorIds } from "@/lib/constants/Warranty"

type Props = Request
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>

useTypeError_Common.qk = (props: Props) => ["head_maintenance", "typeError", "common", props]
useTypeError_Common.queryOptions = (props: Props): QueryOptions => ({
   queryKey: useTypeError_Common.qk(props),
   queryFn: async () => {
      const result = await HeadStaff_TypeError_Common({})
      return result.filter((res) => !SystemTypeErrorIds.has(res.id))
   },
})

function useTypeError_Common(props: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
   return useQuery({
      ...useTypeError_Common.queryOptions(props),
      ...queryOptions,
   })
}

export default useTypeError_Common
