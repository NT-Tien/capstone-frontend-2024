import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import HeadStaff_Request_ApproveWarranty from "@/features/head-maintenance/api/request/approve-warranty.api"

type Request = {
   id: string
   payload: {
      note: string
   }
} & AuthTokenWrapper

type Response = {}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_ApproveToWarranty(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Request_ApproveWarranty,
      mutationKey: ["head-maintenance", "request", "approve-to-warranty"],
   })
}
