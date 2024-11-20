import HeadStaff_Request_ApproveFix, {
   Request,
   Response,
} from "@/features/head-maintenance/api/request/approve-fix.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_ApproveToFix(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Request_ApproveFix,
      mutationKey: ["head-maintenance", "request", "approve-to-fix"],
   })
}
