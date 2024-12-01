import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Request_Reject, { Request, Response } from "@/features/head-maintenance/api/request/reject.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_Reject(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Request_Reject,
      mutationKey: ["head-maintenance", "request", "reject"],
   })
}
