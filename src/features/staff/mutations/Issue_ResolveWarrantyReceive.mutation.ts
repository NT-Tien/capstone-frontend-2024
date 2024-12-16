import Staff_Issue_ResolveWarrantyReceive, {
    Request,
    Response,
 }  from "@/features/staff/api/issue/resolve-warranty-receive.api"
 import useCustomMutation from "@/lib/hooks/useCustomMutation"
 import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
 
 type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
 export default function useIssue_ResolveReceiveWarranty(props?: Props) {
    return useCustomMutation({
       options: props ?? null,
       mutationFn: Staff_Issue_ResolveWarrantyReceive,
       mutationKey: ["staff", "issue", "resolve-disassemble-warranty"],
    })
 }
 