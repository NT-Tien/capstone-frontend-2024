import { UseMutationOptions } from "@tanstack/react-query"

export type CustomMutationHookProps<TData, TError, TVariables, TContext> = {
   showMessages?: boolean
   mutationProps?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "mutationFn" | "mutationKey">
}
