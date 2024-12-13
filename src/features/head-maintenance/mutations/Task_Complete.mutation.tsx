import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Task_UpdateComplete, {
   type Request,
   type Response,
} from "@/features/head-maintenance/api/task/update-complete.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_Complete(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Task_UpdateComplete,
      mutationKey: ["head-maintenance", "task", "complete"],
   })
}
