import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Admin_SpareParts_Create, { type Request, type Response } from "@/features/admin/api/spare-part/create.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>

export default function useSparePart_Create(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Admin_SpareParts_Create,
      mutationKey: ["admin", "spare-part", "create"],
   })
}
