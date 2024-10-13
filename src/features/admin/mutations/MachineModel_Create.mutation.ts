import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Admin_MachineModels_Create, { type Request, type Response } from "@/features/admin/api/machine-model/create.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useMachineModel_Create(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Admin_MachineModels_Create,
      mutationKey: ["admin", "machine-model", "create"],
   })
}
