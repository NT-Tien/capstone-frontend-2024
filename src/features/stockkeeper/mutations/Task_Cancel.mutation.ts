import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Stockkeeper_Task_Cancel, { type Request, type Response } from "@/features/stockkeeper/api/task/cancel.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_Cancel(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Stockkeeper_Task_Cancel,
      mutationKey: ["head-department", "task", "cancel"],
   })
}
