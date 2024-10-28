import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Staff_Issue_UpdateFinish, { Request, Response } from "@/features/staff/api/issue/update-finish"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssue_Resolve(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Staff_Issue_UpdateFinish,
      mutationKey: ["staff", "issue", "resolve"],
   })
}
