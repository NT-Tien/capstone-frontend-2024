import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Admin_MachineModel_Update, { type Request, type Response } from "@/features/admin/api/machine-model/update.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useMachineModel_Update(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Admin_MachineModel_Update,
      mutationKey: ["admin", "machine-model", "update"],
   })
}
