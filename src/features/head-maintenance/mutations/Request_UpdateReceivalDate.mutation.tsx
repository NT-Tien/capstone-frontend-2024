import HeadStaff_Request_UpdateReceivalDate, {
   type Request,
   type Response,
} from "@/features/head-maintenance/api/request/warranty-update-receival-date.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_WarrantyUpdateReceivalDate(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Request_UpdateReceivalDate,
      mutationKey: ["head-maintenance", "request", "warranty", "update-receival-date"],
   })
}
