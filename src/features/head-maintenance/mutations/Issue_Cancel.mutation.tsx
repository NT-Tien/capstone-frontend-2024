import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Issue_Update, { Response } from "@/features/head-maintenance/api/issue/update.api"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"

type Request = {
   id: string
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssue_Cancel(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         return HeadStaff_Issue_Update({
            id: req.id,
            payload: {
               status: IssueStatusEnum.CANCELLED,
            },
         })
      },
      mutationKey: ["head-maintenance", "issue", "update"],
      messages: {
         success: "Cập nhật thành công!",
         error: "Cập nhật thất bại",
      },
   })
}
