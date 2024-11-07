import { NotFoundError } from "@/lib/error/not-found.error"
import { QueryKey, UseQueryOptions } from "@tanstack/react-query"

export default function generateQueryNotFoundOptions<TQueryFnData, TError, TData, TQueryKey extends QueryKey>(): Pick<
   UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
   "retry" | "refetchOnWindowFocus"
> {
   return {
      retry(failureCount, error) {
         if (error instanceof NotFoundError) return false
         return failureCount < 16
      },
      refetchOnWindowFocus(query) {
         return !(query.state.error instanceof NotFoundError)
      },
   }
}
