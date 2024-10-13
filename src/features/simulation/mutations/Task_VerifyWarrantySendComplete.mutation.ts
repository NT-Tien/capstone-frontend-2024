import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import AuthTokens from "@/lib/constants/AuthTokens"
import HeadStaff_Request_UpdateStatus from "@/features/head-maintenance/api/request/updateStatus.api"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import dayjs from "dayjs"
import HeadStaff_Task_UpdateComplete from "@/features/head-maintenance/api/task/update-complete.api"
import { ReceiveWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import HeadStaff_Task_Create from "@/features/head-maintenance/api/task/create.api"
import HeadStaff_Issue_Create from "@/features/head-maintenance/api/issue/create.api"
import { FixType } from "@/lib/domain/Issue/FixType.enum"
import HeadStaff_Task_Update from "@/features/head-maintenance/api/task/update.api"

type Request = {
   tasks: TaskDto[]
}

type Response = {
   requests: RequestDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_VerifyWarrantySendComplete(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         if (!req.tasks) {
            throw new Error("Yêu cầu không được để trống")
         }

         const returnDate = dayjs().toISOString()

         const response = await Promise.allSettled(
            req.tasks.map(async (task) => {
               // update request
               await HeadStaff_Request_UpdateStatus({
                  id: task.request.id,
                  payload: {
                     return_date_warranty: returnDate,
                  },
                  token: AuthTokens.Head_Maintenance,
               })

               // update task status to completed
               return await HeadStaff_Task_UpdateComplete({
                  id: task.id,
                  token: AuthTokens.Head_Maintenance,
               })
            }),
         )

         const requests = response.filter((res) => res.status === "fulfilled").map((res: any) => res.value)
         const errors = response.filter((res) => res.status === "rejected").map((res: any) => res.reason)

         if (errors.length > 0) {
            throw new Error("Có lỗi xảy ra")
         }

         return { requests }
      },
      mutationKey: ["simulation", "task", "verifyWarrantySendComplete"],
   })
}
