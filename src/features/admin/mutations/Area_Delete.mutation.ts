import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Admin_Areas_Delete, { type Request, type Response } from "@/features/admin/api/area/delete.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useArea_Delete(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Admin_Areas_Delete,
      mutationKey: ["admin", "area", "delete"],
   })
}
