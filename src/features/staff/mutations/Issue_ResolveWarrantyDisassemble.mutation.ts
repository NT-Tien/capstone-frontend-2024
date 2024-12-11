import Staff_Issue_ResolveWarrantyDisassemble, {
   Request,
   Response,
} from "@/features/staff/api/issue/resolve-warranty-disassemble.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssue_ResolveDisassembleWarranty(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Staff_Issue_ResolveWarrantyDisassemble,
      mutationKey: ["staff", "issue", "resolve-disassemble-warranty"],
   })
}
