import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Notifications_Seen, { Request, Response } from "@/features/head-maintenance/api/notifications-seen.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useNotifications_Seen(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Notifications_Seen,
      mutationKey: ["head-maintenance", "notification", "seen"],
   })
}
