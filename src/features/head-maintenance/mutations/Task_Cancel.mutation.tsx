import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Task_Cancel from "@/features/head-maintenance/api/task/cancel.api"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import HeadStaff_Issue_Update from "@/features/head-maintenance/api/issue/update.api"

type Request = {
   task: TaskDto
}
type Response = {}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTaskCancel(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         await HeadStaff_Task_Cancel({ id: req.task.id })
         const response = await Promise.allSettled(
            req.task.issues.map((issue) => {
               return HeadStaff_Issue_Update({
                  id: issue.id,
                  payload: {
                     task: null,
                  },
               })
            }),
         )
         return {}
      },
      mutationKey: ["head-maintenance", "task", "cancel"],
   })
}
