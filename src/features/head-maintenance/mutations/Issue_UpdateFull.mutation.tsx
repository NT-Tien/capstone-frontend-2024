import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Issue_Update from "@/features/head-maintenance/api/issue/update.api"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import useIssueSparePart_ReplaceMany from "@/features/head-maintenance/mutations/IssueSparePart_Replace.mutation"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"

type Request = {
   issueId: string
   newIssue: IssueDto
   oldIssueSparePartIds: string[]
}
type Response = {}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssue_UpdateFull(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         const isFailedIssue = req.newIssue.status === IssueStatusEnum.FAILED
         const failedData = {
            status: IssueStatusEnum.PENDING,
            task: null,
         }
         await Promise.allSettled([
            await HeadStaff_Issue_Update({
               id: req.issueId,
               payload: {
                  description: req.newIssue.description,
                  fixType: req.newIssue.fixType,
                  ...(isFailedIssue ? failedData : {}),
               },
            }),
            useIssueSparePart_ReplaceMany.mutationFn({
               issues: [req.newIssue],
               oldIssueIds: req.oldIssueSparePartIds,
            }),
         ])

         return {}
      },
      mutationKey: ["head-maintenance", "issue", "update"],
      messages: {
         success: "Cập nhật thành công!",
         error: "Cập nhật thất bại",
      },
   })
}
