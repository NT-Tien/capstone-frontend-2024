import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Task_Create from "@/features/head-maintenance/api/task/create.api"
import HeadStaff_Issue_Create from "@/features/head-maintenance/api/issue/create.api"
import { FixType } from "@/lib/domain/Issue/FixType.enum"
import { DismantleOldDeviceTypeErrorId } from "@/lib/constants/Warranty"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import dayjs from "dayjs"
import HeadStaff_Request_UpdateStatus from "@/features/head-maintenance/api/request/updateStatus.api"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import HeadStaff_Task_Update from "@/features/head-maintenance/api/task/update.api"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import HeadStaff_Task_UpdateAssignRenewDevice from "@/features/head-maintenance/api/task/update-assignRenewDevice.api"

type Request = {
   requestId: string
   selectedDeviceId: string
   request: RequestDto
}

type Response = null

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useCreateRenewRequestMutation(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         // create issue
         const issue = await HeadStaff_Issue_Create({
            request: req.requestId,
            fixType: FixType.REPLACE,
            typeError: DismantleOldDeviceTypeErrorId,
            description: "Thay thế thiết bị cũ bằng thiết bị mới",
         })

         // create renew task
         const task = await HeadStaff_Task_Create({
            request: req.requestId,
            totalTime: 60,
            issueIDs: [issue.id],
            operator: 0,
            priority: false,
            name: `${dayjs(req.request.createdAt).add(7, "hours").format("DDMMYY")}_${req.request.device.area.name}_${req.request.device.machineModel.name}_Thay máy`,
         })

         await HeadStaff_Task_Update({
            id: task.id,
            payload: {
               status: TaskStatus.AWAITING_FIXER,
            },
         })

         await HeadStaff_Task_UpdateAssignRenewDevice({
            renewDeviceId: req.selectedDeviceId,
            taskId: task.id,
         })

         // change status of request
         await HeadStaff_Request_UpdateStatus({
            id: req.requestId,
            payload: {
               status: FixRequestStatus.IN_PROGRESS,
            },
         })

         return null
      },
      mutationKey: ["head-maintenance", "request", "create-renew"],
      messages: {
         success: "Cập nhật thành công!",
         error: "Cập nhật thất bại",
      },
   })
}
