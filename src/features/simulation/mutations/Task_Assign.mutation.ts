import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import HeadStaff_Task_Update from "@/features/head-maintenance/api/task/update.api"
import AuthTokens from "@/lib/constants/AuthTokens"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import dayjs from "dayjs"
import { useQueryClient } from "@tanstack/react-query"
import HeadStaff_Users_AllStaff from "@/features/head-maintenance/api/users/all.api"

type Request = {
   tasks: TaskDto[]
}

type Response = {
   tasks: TaskDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_AssignFixer(props?: Props) {
   const queryClient = useQueryClient()

   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         const fixers = await queryClient.ensureQueryData({
            queryKey: ["head-maintenance", "fixer"],
            queryFn: () => HeadStaff_Users_AllStaff({ token: AuthTokens.Head_Maintenance }),
         })

         const fixerIds = fixers.map((fixer) => fixer.id)

         const response = await Promise.allSettled(
            req.tasks.map(async (task) => {
               return await HeadStaff_Task_Update({
                  token: AuthTokens.Head_Maintenance,
                  id: task.id,
                  payload: {
                     priority: false,
                     status: TaskStatus.ASSIGNED,
                     fixer: fixerIds[Math.floor(Math.random() * fixerIds.length)],
                     fixerDate: dayjs().toISOString(),
                  },
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
      mutationKey: ["simulation", "request", "approve"],
   })
}
