import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Task_Update, { Request, Response } from "@/features/head-maintenance/api/task/update.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTaskUpdate(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Task_Update,
      mutationKey: ["head-maintenance", "task", "update"],
   })
}
