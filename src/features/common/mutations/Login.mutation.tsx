import LoginCredentials, { type Request, type Response } from "@/features/common/api/login-credentials.api"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import useCustomMutation from "@/lib/hooks/useCustomMutation"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useLoginMutation(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: LoginCredentials,
      mutationKey: ["common", "login"],
      messages: {
         success: "Đăng nhập thành công!",
         error: "Đăng nhập thất bại",
      },
   })
}
