import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Admin_Areas_Update, { type Request, type Response } from "@/features/admin/api/area/update.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useArea_Update(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Admin_Areas_Update,
      mutationKey: ["admin", "area", "update"],
   })
}
