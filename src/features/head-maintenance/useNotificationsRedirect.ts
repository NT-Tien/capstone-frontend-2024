import { useRouter } from "next/navigation"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import HeadMaintenance_NotificationIdentifiers from "@/features/head-maintenance/notifications"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import { useQueryClient } from "@tanstack/react-query"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import hm_uris from "@/features/head-maintenance/uri"

function useHeadMaintenance_notificationsRedirecter() {
   const router = useRouter()
   const queryClient = useQueryClient()

   const mutate_updateSeen = head_maintenance_mutations.notifications.seen({ showMessages: false })

   function handleRedirect(res: NotificationDto) {
      if (!res.seen) {
         mutate_updateSeen.mutate(
            { id: res.id },
            {
               onSuccess: async () => {
                  await queryClient.invalidateQueries({
                     queryKey: head_maintenance_queries.notifications.all.qk({}),
                  })
               },
            },
         )
      }

      switch (res.identifier) {
         case HeadMaintenance_NotificationIdentifiers.REQUEST_CREATED:
            router.push(hm_uris.stack.requests_id(res.subjectId ?? ""))
            break
         case HeadMaintenance_NotificationIdentifiers.TASK_STARTED:
            router.push(hm_uris.stack.tasks_id(res.content.requestId ?? ""))
            break
      }
   }

   return handleRedirect
}

export default useHeadMaintenance_notificationsRedirecter
