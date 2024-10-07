import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import AuthTokens from "@/lib/constants/AuthTokens"
import { useQueryClient } from "@tanstack/react-query"
import HeadStaff_Users_AllStaff from "@/features/head-maintenance/api/users/all.api"
import Staff_Task_UpdateStart from "@/features/staff/api/task/update-start.api"
import Staff_Issue_UpdateFinish from "@/features/staff/api/issue/update-finish"
import Staff_Task_UpdateFinish from "@/features/staff/api/task/update-finish.api"
import HeadStaff_Task_UpdateComplete from "@/features/head-maintenance/api/task/update-complete.api"

type Request = {
   tasks: TaskDto[]
   withHeadStaffConfirm?: boolean
}

type Response = {
   tasks: TaskDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_Finish(props?: Props) {
   const queryClient = useQueryClient()

   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         const fixers = await queryClient.ensureQueryData({
            queryKey: ["head-maintenance", "fixer"],
            queryFn: () => HeadStaff_Users_AllStaff({ token: AuthTokens.Head_Maintenance }),
         })

         console.log(req.tasks)

         const response = await Promise.allSettled(
            req.tasks.map(async (task) => {
               console.log(task)
               const currentFixer = fixers.find((fixer) => fixer.id === task.fixer.id)

               const fixerToken = Object.entries(AuthTokens.Staff).filter(
                  ([key, value]) => key === currentFixer?.username,
               )[0]?.[1]

               console.log(fixerToken)

               // start task
               await Staff_Task_UpdateStart({
                  token: fixerToken,
                  id: task.id,
               })

               // finish all issues in task
               await Promise.allSettled(
                  task.issues.map(async (issue) => {
                     return await Staff_Issue_UpdateFinish({
                        token: fixerToken,
                        id: task.id,
                        payload: {
                           imagesVerify: ["mock-image", "mock-image"],
                           videosVerify: "mock-video",
                        },
                     })
                  }),
               )

               // finish task
               await Staff_Task_UpdateFinish({
                  id: task.id,
                  payload: {
                     fixerNote: "Bảo hành xong",
                     imagesVerify: ["signature"],
                     videosVerify: "video",
                  },
                  token: fixerToken,
               })

               if (req.withHeadStaffConfirm) {
                  await HeadStaff_Task_UpdateComplete({
                     id: task.id,
                     token: AuthTokens.Head_Maintenance,
                  })
               }
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
      mutationKey: ["simulation", "task", "finish"],
   })
}
