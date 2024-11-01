import useCustomMutation from "@/lib/hooks/useCustomMutation";
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps";
import Admin_Devices_Create, { type Request, type Response } from "../api/device/create.api";

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useDevice_Create(props?: Props) {
    return useCustomMutation({
        options: props ?? null,
        mutationFn: Admin_Devices_Create,
        mutationKey: ["admin", "device", "create"],
    })
}