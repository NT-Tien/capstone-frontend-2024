import useCustomMutation from "@/lib/hooks/useCustomMutation";
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps";
import Admin_Devices_Update, { type Request, type Response } from "../api/device/update.api";

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useDevice_Update(props?: Props) {
    return useCustomMutation({
        options: props ?? null,
        mutationFn: Admin_Devices_Update,
        mutationKey: ["admin", "device", "update"],
    })
}