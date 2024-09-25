import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import App from "antd/es/app"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props<TData, TError, TVariables, TContext> = {
   options: CustomMutationHookProps<TData, TError, TVariables, TContext> | null
   messages?: {
      loading?: string
      error?: string
      success?: string
   }
   mutationKey: string[]
} & UseMutationOptions<TData, TError, TVariables, TContext>

export default function useCustomMutation<TData, TError, TVariables, TContext>(
   props: Props<TData, TError, TVariables, TContext>,
) {
   const { message } = App.useApp()

   const showMessages = props?.options?.showMessages ?? true

   const messageKey = props.mutationKey?.join("_")

   return useMutation({
      ...props,
      onMutate: async (req) => {
         if (showMessages) {
            message.destroy(messageKey ?? "loading")
            message.loading({
               content: props.messages?.loading ?? "Đang xử lý...",
               key: messageKey ?? "loading",
            })
         }
         return props?.onMutate?.(req)
      },
      onSettled: (res, error, variables, context) => {
         if (showMessages) {
            message.destroy(messageKey ?? "loading")
         }
         return props?.onSettled?.(res, error, variables, context)
      },
      onError: async (error, variables, context) => {
         if (showMessages) {
            message.error({
               content: props.messages?.success ?? "Thất bại",
            })
         }
         return props?.onError?.(error, variables, context)
      },
      onSuccess: async (data, variables, context) => {
         if (showMessages) {
            message.success({
               content: props.messages?.success ?? "Thành công",
            })
         }
         return props?.onSuccess?.(data, variables, context)
      },
   })
}
