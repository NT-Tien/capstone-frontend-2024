import Staff_Task_UpdateFinishWarrantySend, {
   Request,
   Response,
} from "@/features/staff/api/task/update-finish-warranty-send.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_FinishWarrantySend(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Staff_Task_UpdateFinishWarrantySend,
      mutationKey: ["staff", "task", "finish", "warranty-send"],
   })
}
