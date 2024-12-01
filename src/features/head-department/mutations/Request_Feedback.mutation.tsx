import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Head_Request_Feedback, { type Request, type Response } from "@/features/head-department/api/request/feedback.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_Feedback(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Head_Request_Feedback,
      mutationKey: ["head-department", "request", "feedback"],
   })
}
