import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Staff_Issue_UpdateFailed, { Request, Response } from "@/features/staff/api/issue/update-fail"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssue_Failed(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Staff_Issue_UpdateFailed,
      mutationKey: ["staff", "issue", "failed"],
   })
}
