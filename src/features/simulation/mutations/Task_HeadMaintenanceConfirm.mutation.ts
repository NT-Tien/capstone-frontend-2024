import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import AuthTokens from "@/lib/constants/AuthTokens"
import HeadStaff_Task_UpdateComplete from "@/features/head-maintenance/api/task/update-complete.api"

type Request = {
   tasks: TaskDto[]
}

type Response = {
   tasks: TaskDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_HeadMaintenanceConfirm(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         const response = await Promise.allSettled(
            req.tasks.map((task) => {
               return HeadStaff_Task_UpdateComplete({
                  id: task.id,
                  token: AuthTokens.Head_Maintenance,
               })
            }),
         )

         const success = response.filter((res) => res.status === "fulfilled").map((res: any) => res.value)
         const failed = response.filter((res) => res.status === "rejected").map((res: any) => res.reason)

         if (failed.length > 0) {
            throw new Error(failed.join(","))
         }

         return {
            tasks: success,
         }
      },
      mutationKey: ["simulation", "task", "head-maintenance-confirm"],
   })
}
