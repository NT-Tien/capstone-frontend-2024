import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Request_UpdateStatus, {
   type Request as UpdateRequest,
   type Response,
} from "@/features/head-maintenance/api/request/updateStatus.api"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

type Request = Omit<UpdateRequest, "payload"> & {
   payload: {
      checker_note: UpdateRequest["payload"]["checker_note"]
      checker: UpdateRequest["payload"]["checker"]
      checker_date: UpdateRequest["payload"]["checker_date"]
   }
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_Reject(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         return HeadStaff_Request_UpdateStatus({
            ...req,
            payload: {
               status: FixRequestStatus.REJECTED,
               ...req.payload,
            },
         })
      },
      mutationKey: ["head-maintenance", "request", "reject"],
   })
}
