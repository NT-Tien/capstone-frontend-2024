import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Stockkeeper_Issue_CompleteReturnDevice, {
   type Request,
   type Response,
} from "@/features/stockkeeper/api/issue/resolve-warranty.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssue_CompleteReturnDevice(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Stockkeeper_Issue_CompleteReturnDevice,
      mutationKey: ["stockkeeper", "issue", "complete-return-device"],
   })
}
