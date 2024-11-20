import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Request_ApproveRenew from "../api/request/approve.renew.api"

type Request = {
    id: string
    payload: {
        deviceId?: string
        note: string
    }
} & AuthTokenWrapper

type Response = {}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_ApproveToRenew(props?: Props) {
    return useCustomMutation({
        options: props ?? null,
        mutationFn: HeadStaff_Request_ApproveRenew,
        mutationKey: ["head-maintenance", "request", "approve-to-renew"]
    })
}