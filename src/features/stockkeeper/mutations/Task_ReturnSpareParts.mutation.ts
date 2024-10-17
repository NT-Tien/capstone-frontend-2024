import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Stockkeeper_Task_ReturnSpareParts, {
   type Request,
   type Response,
} from "@/features/stockkeeper/api/task/return-spare-parts.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_ReturnSpareParts(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Stockkeeper_Task_ReturnSpareParts,
      mutationKey: ["head-department", "task", "return-spare-parts"],
   })
}
