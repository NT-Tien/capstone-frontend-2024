import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Task_Cancel, { Request, Response } from "@/features/head-maintenance/api/task/cancel.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTaskCancel(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Task_Cancel,
      mutationKey: ["head-maintenance", "task", "cancel"],
   })
}
