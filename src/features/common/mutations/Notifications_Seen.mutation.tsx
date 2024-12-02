import Notifications_Seen, { type Request, type Response } from "@/features/common/api/notifications/seen.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useNotifications_Seen(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Notifications_Seen,
      mutationKey: ["notifications", "seen"],
   })
}
