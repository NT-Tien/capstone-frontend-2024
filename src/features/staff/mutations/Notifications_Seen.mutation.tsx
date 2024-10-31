import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { Request, Response } from "@/features/head-maintenance/api/notifications-seen.api"
import Staff_Notifications_Seen from "@/features/staff/api/notifications-seen.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useNotifications_Seen(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: Staff_Notifications_Seen,
      mutationKey: ["staff", "notification", "seen"],
   })
}
