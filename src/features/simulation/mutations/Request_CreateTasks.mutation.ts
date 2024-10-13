import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import AuthTokens from "@/lib/constants/AuthTokens"
import HeadStaff_Task_Create from "@/features/head-maintenance/api/task/create.api"
import { generateTaskName } from "@/features/head-maintenance/components/overlays/Task_Create.drawer"
import HeadStaff_Task_UpdateAwaitSparePartToAssignFixer from "@/features/head-maintenance/api/task/update-awaitSparePartToAssignFixer.api"

type Request = {
   requests: RequestDto[]
}

type Response = {
   requests: RequestDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_CreateTasks(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         const response = await Promise.allSettled(
            req.requests.map(async (request) => {
               const tasks = await Promise.allSettled(
                  request.issues.map((issue) => {
                     return HeadStaff_Task_Create({
                        name: generateTaskName(request, [issue.id]),
                        token: AuthTokens.Head_Maintenance,
                        request: request.id,
                        totalTime: issue.typeError.duration,
                        issueIDs: [issue.id],
                        priority: false,
                        operator: 0,
                     })
                  }),
               )

               const success = tasks.filter((task) => task.status === "fulfilled").map((task: any) => task.value)
               const errors = tasks.filter((task) => task.status === "rejected").map((task: any) => task.reason)

               if (errors.length > 0) {
                  throw new Error(errors.map((error) => error.message).join("\n"))
               }

               const updated = await Promise.allSettled(
                  success.map((task) => {
                     HeadStaff_Task_UpdateAwaitSparePartToAssignFixer({
                        id: task.id,
                        token: AuthTokens.Head_Maintenance,
                     })
                  }),
               )
            }),
         )

         const success = response.filter((res) => res.status === "fulfilled").map((res: any) => res.value)
         const errors = response.filter((res) => res.status === "rejected").map((res: any) => res.reason)

         if (errors.length > 0) {
            throw new Error(errors.map((error) => error.message).join("\n"))
         }

         return {
            requests: success,
         }
      },
      mutationKey: ["simulation", "task", "create"],
   })
}
