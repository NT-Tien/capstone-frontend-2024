import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_IssueSparePart_Delete from "@/features/head-maintenance/api/spare-part/delete.api"
import HeadStaff_IssueSparePart_Create from "@/features/head-maintenance/api/spare-part/create.api"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"

type Request = {
   issues: IssueDto[]
   oldIssueIds: string[]
}

type Response = {}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssueSparePart_ReplaceMany(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: useIssueSparePart_ReplaceMany.mutationFn,
      mutationKey: ["head-maintenance", "issue", "update"],
      messages: {
         success: "Cập nhật thành công!",
         error: "Cập nhật thất bại",
      },
   })
}
useIssueSparePart_ReplaceMany.mutationFn = async (req: Request) => {
   await Promise.allSettled(
      req.oldIssueIds.map((id) => {
         HeadStaff_IssueSparePart_Delete({ id })
      }),
   )
   const response = await Promise.allSettled(
      req.issues.map(async (i) => {
         i.issueSpareParts.map(async (isp) => {
            await HeadStaff_IssueSparePart_Create({
               issue: i.id,
               quantity: isp.quantity,
               sparePart: isp.sparePart.id,
            })
         })
      }),
   )

   const success = response.filter((r) => r.status === "fulfilled").map((r: any) => r.value)
   const error = response.filter((r) => r.status === "rejected").map((r: any) => r.reason)

   return success
}
