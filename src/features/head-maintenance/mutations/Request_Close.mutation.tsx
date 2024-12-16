import HeadStaff_Request_Close , {
    Request,
    Response,
 } from "@/features/head-maintenance/api/request/close.api"
 import useCustomMutation from "@/lib/hooks/useCustomMutation"
 import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
 
 type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
 export default function useRequest_Close(props?: Props) {
    return useCustomMutation({
       options: props ?? null,
       mutationFn: HeadStaff_Request_Close,
       mutationKey: ["head-maintenance", "request", "close"],
    })
 }
 