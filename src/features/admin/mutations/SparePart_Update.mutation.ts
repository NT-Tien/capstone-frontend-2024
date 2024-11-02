import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Admin_SpareParts_Update, { type Request, type Response } from "../api/spare-part/update.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>

export default function useSparePart_Update(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Admin_SpareParts_Update,
      mutationKey: ["admin", "spare-part", "update"],
   })
}
