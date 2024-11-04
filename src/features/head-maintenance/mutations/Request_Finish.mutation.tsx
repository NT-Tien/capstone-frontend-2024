import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Request_UpdateStatus, {
   type Request as UpdateRequest,
   type Response,
} from "@/features/head-maintenance/api/request/updateStatus.api"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

type Request = Omit<UpdateRequest, "payload"> & {}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_Finish(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         return HeadStaff_Request_UpdateStatus({
            ...req,
            payload: {
               status: FixRequestStatus.HEAD_CONFIRM,
            },
         })
      },
      mutationKey: ["head-maintenance", "request", "reject"],
   })
}
