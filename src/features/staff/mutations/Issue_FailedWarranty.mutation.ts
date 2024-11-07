import Staff_Issue_UpdateFailedWarranty, { Request, Response } from "@/features/staff/api/issue/update-fail-warranty.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssue_FailedWarranty(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Staff_Issue_UpdateFailedWarranty,
      mutationKey: ["staff", "issue", "failed-warranty"],
   })
}
