import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Staff_Task_UpdateFinish, { Request, Response } from "@/features/staff/api/task/update-finish.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_Finish(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Staff_Task_UpdateFinish,
      mutationKey: ["staff", "task", "finish"],
   })
}
