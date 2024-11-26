import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Stockkeeper_SparePart_Update, {
   Request,
   Response,
} from "@/features/stockkeeper/api/spare-part/update-spare-part-by-id.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useSparePart_UpdateQuantity(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Stockkeeper_SparePart_Update,
      mutationKey: ["head-department", "spare-part", "update-quantity"],
   })
}
