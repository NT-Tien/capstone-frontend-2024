import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import HeadStaff_Issue_Create from "@/features/head-maintenance/api/issue/create.api"
import { FixType } from "@/lib/domain/Issue/FixType.enum"
import {
   AssembleDeviceTypeErrorId,
   DisassembleDeviceTypeErrorId,
   ReceiveWarrantyTypeErrorId,
   SendWarrantyTypeErrorId,
} from "@/lib/constants/Warranty"
import HeadStaff_Request_UpdateStatus from "@/features/head-maintenance/api/request/updateStatus.api"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import HeadStaff_Task_Create from "@/features/head-maintenance/api/task/create.api"
import TaskNameGenerator from "@/lib/domain/Task/TaskNameGenerator.util"
import { useQueryClient } from "@tanstack/react-query"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import HeadStaff_Task_Update from "@/features/head-maintenance/api/task/update.api"

type Request = {
   id: string
   payload: {
      note: string
   }
} & AuthTokenWrapper

type Response = {}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_ApproveToWarranty(props?: Props) {
   const queryClient = useQueryClient()

   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         // create dismantle, send, receive, install issues
         const responses = await Promise.allSettled([
            await HeadStaff_Issue_Create({
               fixType: FixType.REPAIR,
               request: req.id,
               typeError: DisassembleDeviceTypeErrorId,
               description: req.payload.note,
            }),
            await HeadStaff_Issue_Create({
               fixType: FixType.REPAIR,
               request: req.id,
               typeError: SendWarrantyTypeErrorId,
               description: req.payload.note,
            }),
            await HeadStaff_Issue_Create({
               fixType: FixType.REPAIR,
               request: req.id,
               typeError: ReceiveWarrantyTypeErrorId,
               description: "",
            }),
            await HeadStaff_Issue_Create({
               fixType: FixType.REPAIR,
               request: req.id,
               typeError: AssembleDeviceTypeErrorId,
               description: "",
            }),
         ])

         const issueDisassemble = await HeadStaff_Issue_Create({
            fixType: FixType.REPAIR,
            request: req.id,
            typeError: DisassembleDeviceTypeErrorId,
            description: req.payload.note,
         })
         const issueSend = await HeadStaff_Issue_Create({
            fixType: FixType.REPAIR,
            request: req.id,
            typeError: SendWarrantyTypeErrorId,
            description: req.payload.note,
         })
         const issueReceive = await HeadStaff_Issue_Create({
            fixType: FixType.REPAIR,
            request: req.id,
            typeError: ReceiveWarrantyTypeErrorId,
            description: "",
         })
         const issueAssemble = await HeadStaff_Issue_Create({
            fixType: FixType.REPAIR,
            request: req.id,
            typeError: AssembleDeviceTypeErrorId,
            description: "",
         })

         const request = await queryClient.fetchQuery(
            head_maintenance_queries.request.one.queryOptions({
               id: req.id,
            }),
         )

         // approve request
         await HeadStaff_Request_UpdateStatus({
            id: req.id,
            payload: {
               status: FixRequestStatus.APPROVED,
               is_warranty: true,
            },
         })

         // create send to warranty task
         const task = await HeadStaff_Task_Create({
            request: req.id,
            totalTime: 60,
            operator: 0,
            priority: false,
            issueIDs: [issueSend.id, issueDisassemble.id],
            name: TaskNameGenerator.generateWarranty(request),
         })

         const updateTask = await HeadStaff_Task_Update({
            id: task.id,
            payload: {
               status: TaskStatus.AWAITING_FIXER,
            },
         })

         return task
      },
      mutationKey: ["head-maintenance", "request", "approve-to-warranty"],
   })
}
