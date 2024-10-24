import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import App from "antd/es/app"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props<TData, TError, TVariables, TContext> = {
   options: CustomMutationHookProps<TData, TError, TVariables, TContext> | null
   messageType?: "notification" | "message"
   messages?: {
      loading?: string
      error?: string | ((error: TError) => string)
      success?: string
   }
   mutationKey: string[]
} & UseMutationOptions<TData, TError, TVariables, TContext>

export default function useCustomMutation<TData, TError, TVariables, TContext>(
   props: Props<TData, TError, TVariables, TContext>,
) {
   const { message, notification } = App.useApp()

   const showMessages = props?.options?.showMessages ?? true
   const messageType = props.messageType ?? "message"

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
         console.error(error)
         if (showMessages) {
            const customError =
               typeof props.messages?.error === "function" ? props.messages.error(error) : props.messages?.error
            switch (messageType) {
               case "notification": {
                  notification.error({
                     message: customError ?? "Thất bại",
                  })
                  break
               }
               case "message": {
                  message.error({
                     content: customError ?? "Thất bại",
                  })
                  break
               }
            }
         }
         return props?.onError?.(error, variables, context)
      },
      onSuccess: async (data, variables, context) => {
         if (showMessages) {
            switch (messageType) {
               case "notification": {
                  notification.success({
                     message: props.messages?.success ?? "Thành công",
                  })
                  break
               }
               case "message": {
                  message.success({
                     content: props.messages?.success ?? "Thành công",
                  })
                  break
               }
            }
         }
         return props?.onSuccess?.(data, variables, context)
      },
   })
}
