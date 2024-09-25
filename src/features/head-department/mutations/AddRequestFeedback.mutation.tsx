import useCustomMutation from "@/lib/hooks/useCustomMutation"
import Head_Request_UpdateClose, {
   type Request,
   type Response,
} from "@/features/head-department/api/request/update-close.api"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useAddRequestFeedbackMutation(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Head_Request_UpdateClose,
      mutationKey: ["head-department", "request", "add-feedback"],
      messages: {
         success: "Thêm phản hồi thành công!",
         error: "Thêm phản hồi thất bại",
      },
   })
}
