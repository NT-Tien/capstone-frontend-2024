import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Task_CreateExportWarehouse, {
   Request,
   Response,
} from "@/features/head-maintenance/api/task/create-export-warehouse.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_CreateExportWarehouse(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Task_CreateExportWarehouse,
      mutationKey: ["head-maintenance", "task", "create-export-warehouse"],
   })
}
