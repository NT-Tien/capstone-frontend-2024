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
export default function useRequest_ApproveWarranty(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         const response = await Promise.allSettled(
            req.requests.map(async (request) => {
               const issueSend = await HeadStaff_Issue_Create({
                  description: "Gửi thiết bị bảo hành",
                  typeError: SendWarrantyTypeErrorId,
                  fixType: FixType.REPAIR,
                  request: request.id,
                  token: AuthTokens.Head_Maintenance,
               })

               const issueReceive = await HeadStaff_Issue_Create({
                  description: "Nhận và lắp đặt thiết bị đã bảo hành",
                  typeError: ReceiveWarrantyTypeErrorId,
                  fixType: FixType.REPAIR,
                  request: request.id,
                  token: AuthTokens.Head_Maintenance,
               })

               await HeadStaff_Request_UpdateStatus({
                  id: request.id,
                  payload: {
                     status: FixRequestStatus.APPROVED,
                     is_warranty: true,
                  },
                  token: AuthTokens.Head_Maintenance,
               })

               const task = await HeadStaff_Task_Create({
                  name: `${dayjs(request.createdAt).format("DDMMYY")}_${request.device?.area?.name}_${request.device.machineModel.name}_Bảo hành`,
                  operator: 0,
                  priority: false,
                  issueIDs: [issueSend.id],
                  request: request.id,
                  totalTime: 60,
                  token: AuthTokens.Head_Maintenance,
               })

               await HeadStaff_Task_Update({
                  id: task.id,
                  payload: {
                     status: TaskStatus.AWAITING_FIXER,
                  },
                  token: AuthTokens.Head_Maintenance,
               })

               return task
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
