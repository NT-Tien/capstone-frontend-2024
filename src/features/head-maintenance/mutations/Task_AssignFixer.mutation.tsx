import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Task_UpdateAssignFixer, {
   type Request,
   type Response,
} from "@/features/head-maintenance/api/task/update-assignFixer.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_AssignFixer(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Task_UpdateAssignFixer,
      mutationKey: ["head-maintenance", "request", "seen"],
   })
}
