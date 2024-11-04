import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Staff_Request_UpdateWarrantyDate, {
   Request,
   Response,
} from "@/features/staff/api/request/update-warranty-date.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_UpdateWarrantyDate(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Staff_Request_UpdateWarrantyDate,
      mutationKey: ["staff", "request", "update-warranty"],
   })
}
