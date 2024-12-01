import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Request_Seen, { type Request, type Response } from "@/features/head-maintenance/api/request/seen.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_Seen(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Request_Seen,
      mutationKey: ["head-maintenance", "request", "seen"],
   })
}
