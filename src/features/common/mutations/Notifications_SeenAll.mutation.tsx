import Notifications_SeenAll, { type Request, type Response } from "@/features/common/api/notifications/seen-all.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useNotifications_SeenAll(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Notifications_SeenAll,
      mutationKey: ["notifications", "seen-all"],
   })
}
