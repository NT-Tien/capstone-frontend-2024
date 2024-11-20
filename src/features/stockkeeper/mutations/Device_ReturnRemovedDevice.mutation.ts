import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Stockkeeper_Device_ReturnRemovedDevice, {
   type Request,
   type Response,
} from "../api/device/return-removed-device.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useDevice_ReturnRemovedDevice(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Stockkeeper_Device_ReturnRemovedDevice,
      mutationKey: ["head-department", "device", "return-removed-device"],
   })
}
