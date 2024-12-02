import HeadStaff_Request_CreateReturnWarranty, {
   Request,
   Response,
} from "@/features/head-maintenance/api/request/create-return-warranty.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_CreateReturnWarranty(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Request_CreateReturnWarranty,
      mutationKey: ["head-maintenance", "request", "create-return-warranty"],
   })
}
