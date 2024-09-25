import Head_Request_Create, { type Request, type Response } from "@/features/head-department/api/request/create.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useCreateRequestMutation(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Head_Request_Create,
      mutationKey: ["head-department", "request", "create"],
      messages: {
         success: "Tạo yêu cầu thành công!",
         error: "Tạo yêu cầu thất bại",
      },
   })
}
