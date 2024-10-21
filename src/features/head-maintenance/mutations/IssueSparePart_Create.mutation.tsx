import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_IssueSparePart_Create, {
   Request,
   Response,
} from "@/features/head-maintenance/api/spare-part/create.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssueSparePart_Create(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_IssueSparePart_Create,
      mutationKey: ["head-maintenance", "issue-spare-part", "create"],
   })
}
