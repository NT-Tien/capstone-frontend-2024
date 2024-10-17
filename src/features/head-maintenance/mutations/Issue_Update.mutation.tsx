import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Issue_Update, { Request, Response } from "@/features/head-maintenance/api/issue/update.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssue_Update(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Issue_Update,
      mutationKey: ["head-maintenance", "issue", "update"],
      messages: {
         success: "Cập nhật thành công!",
         error: "Cập nhật thất bại",
      },
   })
}
