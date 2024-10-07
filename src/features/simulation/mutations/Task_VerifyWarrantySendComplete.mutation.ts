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
               await HeadStaff_Task_UpdateComplete({
                  id: task.id,
                  token: AuthTokens.Head_Maintenance,
               })

               // create new task for return
               let issue = task.issues.find((issue) => issue.typeError.id === ReceiveWarrantyTypeErrorId)

               if (!issue) {
                  issue = await HeadStaff_Issue_Create({
                     token: AuthTokens.Head_Maintenance,
                     typeError: ReceiveWarrantyTypeErrorId,
                     request: task.request.id,
                     description: "Lắp máy bảo hành",
                     fixType: FixType.REPLACE,
                  })
               }

               const receiveTask = await HeadStaff_Task_Create({
                  issueIDs: [issue.id],
                  name: `${dayjs(task.request.createdAt).add(7, "hours").format("DDMMYY")}_${task.device.area.name}_${task.device.machineModel.name}_Lắp máy bảo hành`,
                  operator: 0,
                  priority: false,
                  request: task.request.id,
                  totalTime: 60,
                  fixerDate: returnDate,
                  token: AuthTokens.Head_Maintenance,
               })

               const taskUpdate = HeadStaff_Task_Update({
                  id: receiveTask.id,
                  payload: {
                     status: TaskStatus.AWAITING_FIXER,
                  },
                  token: AuthTokens.Head_Maintenance,
               })

               return task
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
