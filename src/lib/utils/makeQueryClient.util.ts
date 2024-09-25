import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query"
import { UnauthorizedError } from "@/lib/error/unauthorized.error"

function createQueryClient() {
   return new QueryClient({
      defaultOptions: {
         queries: {
            throwOnError: (error) => {
               return error instanceof UnauthorizedError
            },
            retry: (_, error) => {
               return !(error instanceof UnauthorizedError)
            },
            refetchOnWindowFocus: true,
         },
         dehydrate: {
            shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === "pending",
         },
      },
   })
}

let browserQueryClient: QueryClient | undefined = undefined

export function makeQueryClient() {
   if (typeof window === "undefined") {
      // Server: Always make new query client
      return createQueryClient()
   }

   // Client: Create client if not already created
   if (!browserQueryClient) browserQueryClient = createQueryClient()
   return browserQueryClient
}
