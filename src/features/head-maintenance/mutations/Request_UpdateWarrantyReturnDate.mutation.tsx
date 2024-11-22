import HeadStaff_Request_UpdateStatus, {
    type Response
} from "@/features/head-maintenance/api/request/updateStatus.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Request = {
   id: string
   payload: {
      return_date_warranty: string
   }
} & AuthTokenWrapper

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_UpdateWarrantyReturnDate(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         return HeadStaff_Request_UpdateStatus({
            ...req,
            payload: {
               return_date_warranty: req.payload.return_date_warranty,
            },
         })
      },
      mutationKey: ["head-maintenance", "request", "update-warranty-return-date"],
   })
}
