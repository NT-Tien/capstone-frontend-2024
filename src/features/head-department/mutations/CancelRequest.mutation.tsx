import useCustomMutation from "@/lib/hooks/useCustomMutation"
import Head_Request_UpdateCancel, {
   type Request,
   type Response,
} from "@/features/head-department/api/request/update-cancel.api"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useCancelRequestMutation(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Head_Request_UpdateCancel,
      mutationKey: ["head-department", "request", "cancel"],
      messages: {
         success: "Hủy yêu cầu thành công!",
         error: "Hủy yêu cầu thất bại",
      },
   })
}
