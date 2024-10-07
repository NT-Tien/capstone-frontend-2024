import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import AuthTokens from "@/lib/constants/AuthTokens"
import { useQueryClient } from "@tanstack/react-query"
import HeadStaff_Users_AllStaff from "@/features/head-maintenance/api/users/all.api"
import Staff_Task_UpdateStart from "@/features/staff/api/task/update-start.api"

type Request = {
   tasks: TaskDto[]
}

type Response = {
   tasks: TaskDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_Start(props?: Props) {
   const queryClient = useQueryClient()

   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         const fixers = await queryClient.ensureQueryData({
            queryKey: ["head-maintenance", "fixer"],
            queryFn: () => HeadStaff_Users_AllStaff({ token: AuthTokens.Head_Maintenance }),
         })

         const response = await Promise.allSettled(
            req.tasks.map(async (task) => {
               const currentFixer = fixers.find((fixer) => fixer.id === task.fixer.id)

               const fixerToken = Object.entries(AuthTokens.Staff).filter(
                  ([key, value]) => key === currentFixer?.username,
               )[0]?.[1]

               return await Staff_Task_UpdateStart({
                  token: fixerToken,
                  id: task.id,
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
      mutationKey: ["simulation", "task", "start"],
   })
}
