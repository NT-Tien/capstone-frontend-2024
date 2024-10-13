import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Areas_Create, { Request, Response } from "@/features/admin/api/area/create.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useArea_Create(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Areas_Create,
      mutationKey: ["admin", "area", "create"],
   })
}
