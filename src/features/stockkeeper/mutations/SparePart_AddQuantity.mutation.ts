import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Stockkeeper_SparePart_Update_Quantity, {
   Request,
   Response,
} from "../api/spare-part/update-spare-part-quantity.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useSparePart_AddQuantity(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Stockkeeper_SparePart_Update_Quantity,
      mutationKey: ["head-department", "spare-part", "update-quantity"],
   })
}
