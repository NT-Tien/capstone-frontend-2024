import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Issue_CreateMany, {
   Request as CreateManyRequest,
} from "@/features/head-maintenance/api/issue/create-many.api"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import HeadStaff_Request_UpdateStatus from "@/features/head-maintenance/api/request/updateStatus.api"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

type Request = {
   id: string
   payload: {
      issues: CreateManyRequest["issues"]
   }
   shouldNotUpdateRequest?: boolean
} & AuthTokenWrapper

type Response = {}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_ApproveToFix(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         // create issues with spare parts
         const issueCreationResult = await HeadStaff_Issue_CreateMany({
            ...req,
            issues: req.payload.issues,
            request: req.id,
         })

         if(req.shouldNotUpdateRequest) return {}

         // update request status to APPROVED
         const updateResult = await HeadStaff_Request_UpdateStatus({
            id: req.id,
            payload: {
               status: FixRequestStatus.APPROVED,
            },
            token: req.token,
         })

         return {}
      },
      mutationKey: ["head-maintenance", "request", "approve-to-fix"],
   })
}
