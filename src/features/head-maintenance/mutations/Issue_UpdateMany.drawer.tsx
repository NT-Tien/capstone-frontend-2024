import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Issue_Update, {
   Request as UpdateRequest,
   Response as UpdateResponse,
} from "@/features/head-maintenance/api/issue/update.api"

type Request = {
   issues: UpdateRequest[]
}

type Response = UpdateResponse[]

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssue_UpdateMany(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         const response = await Promise.allSettled(
            req.issues.map((i) => {
               return HeadStaff_Issue_Update(i)
            }),
         )

         const success = response.filter((r) => r.status === "fulfilled").map((r: any) => r.value)
         const error = response.filter((r) => r.status === "rejected").map((r: any) => r.reason)

         return success
      },
      mutationKey: ["head-maintenance", "issue", "update"],
      messages: {
         success: "Cập nhật thành công!",
         error: "Cập nhật thất bại",
      },
   })
}
