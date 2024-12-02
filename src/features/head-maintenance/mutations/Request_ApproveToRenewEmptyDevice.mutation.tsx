import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Request_ApproveRenewEmptyDevice, {
   Request,
   Response,
} from "../api/request/approve-renew-empty-device.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_ApproveToRenewEmptyDevice(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Request_ApproveRenewEmptyDevice,
      mutationKey: ["head-maintenance", "request", "approve-to-renew-empty-device"],
   })
}
