import HeadStaff_Request_AddReplacementDevice, {
   Request,
   Response,
} from "@/features/head-maintenance/api/request/add-replacement-device.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_AddReplacementDevice(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Request_AddReplacementDevice,
      mutationKey: ["head-maintenance", "request", "add-replacement-device"],
   })
}
