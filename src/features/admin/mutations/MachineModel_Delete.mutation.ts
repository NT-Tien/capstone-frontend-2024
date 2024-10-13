import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Admin_MachineModel_Delete, { type Request, type Response } from "@/features/admin/api/machine-model/delete.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useMachineModel_Delete(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Admin_MachineModel_Delete,
      mutationKey: ["admin", "machine-model", "delete"],
   })
}
