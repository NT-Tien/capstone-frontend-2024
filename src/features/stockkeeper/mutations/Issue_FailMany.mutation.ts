import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Stockkeeper_Issue_Fail from "@/features/stockkeeper/api/issue/fail-issue.api"

type Request = {
   issues: {
      id: string
      reason: string
   }[]
   staffSignature: string
   stockkeeperSignature: string
}

type Response = {}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssueFailMany(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         const response = await Promise.allSettled(
            req.issues.map((issue) => {
               return Stockkeeper_Issue_Fail({
                  id: issue.id,
                  payload: {
                     reason: issue.reason,
                     staffSignature: req.staffSignature,
                     stockkeeperSignature: req.stockkeeperSignature,
                  },
               })
            }),
         )

         return {}
      },
      mutationKey: ["stockkeeper", "issue", "fail-many"],
   })
}
