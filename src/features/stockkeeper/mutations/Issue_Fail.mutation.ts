import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Stockkeeper_Issue_Fail, { type Request, type Response } from "@/features/stockkeeper/api/issue/fail-issue.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssueFail(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Stockkeeper_Issue_Fail,
      mutationKey: ["stockkeeper", "issue", "fail"],
   })
}
