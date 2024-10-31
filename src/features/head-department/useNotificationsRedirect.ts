import { useRouter } from "next/navigation"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { useQueryClient } from "@tanstack/react-query"
import head_department_mutations from "@/features/head-department/mutations"
import head_department_queries from "@/features/head-department/queries"
import hd_uris from "@/features/head-department/uri"
import HeadDepartment_NotificationsIdentifiers from "@/features/head-department/notifications"

function useHeadDepartment_notificationsRedirecter() {
   const router = useRouter()
   const queryClient = useQueryClient()

   const mutate_updateSeen = head_department_mutations.notifications.seen({ showMessages: false })

   function handleRedirect(res: NotificationDto) {
      if (!res.seen) {
         mutate_updateSeen.mutate(
            { id: res.id },
            {
               onSuccess: async () => {
                  await queryClient.invalidateQueries({
                     queryKey: head_department_queries.notifications.all.qk({}),
                  })
               },
            },
         )
      }

      switch (res.identifier) {
         case HeadDepartment_NotificationsIdentifiers.REQUEST_APPROVED:
            router.push(hd_uris.stack.history_id(res.subjectId ?? ""))
            break
         case HeadDepartment_NotificationsIdentifiers.REQUEST_REJECTED:
            router.push(hd_uris.stack.history_id(res.subjectId ?? ""))
            break
      }
   }

   return handleRedirect
}

export default useHeadDepartment_notificationsRedirecter
