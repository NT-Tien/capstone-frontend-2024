import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixType } from "@/lib/domain/Issue/FixType.enum"
import { ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import dayjs from "dayjs"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import HeadStaff_Issue_Create from "@/features/head-maintenance/api/issue/create.api"
import HeadStaff_Request_UpdateStatus from "@/features/head-maintenance/api/request/updateStatus.api"
import HeadStaff_Task_Create from "@/features/head-maintenance/api/task/create.api"
import HeadStaff_Task_Update from "@/features/head-maintenance/api/task/update.api"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import AuthTokens from "@/lib/constants/AuthTokens"

type Request = {
   requests: RequestDto[]
}

type Response = {
   task: TaskDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_CreateReceiveWarrantyTasks(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         const response = await Promise.allSettled(
            req.requests.map(async (request) => {
               // create new task for return
               let issue = request.issues?.find((issue) => issue.typeError.id === ReceiveWarrantyTypeErrorId)

               if (!issue) {
                  issue = await HeadStaff_Issue_Create({
                     token: AuthTokens.Head_Maintenance,
                     typeError: ReceiveWarrantyTypeErrorId,
                     request: request.id,
                     description: "Lắp máy bảo hành",
                     fixType: FixType.REPLACE,
                  })
               }

               const receiveTask = await HeadStaff_Task_Create({
                  issueIDs: [issue.id],
                  name: `${dayjs(request.createdAt).add(7, "hours").format("DDMMYY")}_${request.device.area.name}_${request.device.machineModel.name}_Lắp máy bảo hành`,
                  operator: 0,
                  priority: false,
                  request: request.id,
                  totalTime: 60,
                  fixerDate: request.return_date_warranty ?? undefined,
                  token: AuthTokens.Head_Maintenance,
               })

               const taskUpdate = HeadStaff_Task_Update({
                  id: receiveTask.id,
                  payload: {
                     status: TaskStatus.AWAITING_FIXER,
                  },
                  token: AuthTokens.Head_Maintenance,
               })

               return taskUpdate
            }),
         )

         const success = response.filter((res) => res.status === "fulfilled").map((res: any) => res.value)
         const errors = response.filter((res) => res.status === "rejected").map((res: any) => res.reason)

         if (errors.length > 0) {
            throw new Error(errors.map((error) => error.message).join("\n"))
         }

         return {
            task: success,
         }
      },
      mutationKey: ["simulation", "request", "approve-warranty"],
   })
}
