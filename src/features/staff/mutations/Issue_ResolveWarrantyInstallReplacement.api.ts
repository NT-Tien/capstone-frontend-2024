import Staff_Issue_ResolveWarrantyInstallReplacement, {
    Request,
    Response,
 } from "@/features/staff/api/issue/resolve-warranty-install_replacement.api"
 import useCustomMutation from "@/lib/hooks/useCustomMutation"
 import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
 
 type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
 export default function useIssue_ResolveInstallReplacementWarranty(props?: Props) {
    return useCustomMutation({
       options: props ?? null,
       mutationFn: Staff_Issue_ResolveWarrantyInstallReplacement,
       mutationKey: ["staff", "issue", "resolve-install-replacement-warranty"],
    })
 }
 