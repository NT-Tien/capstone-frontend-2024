import { useRouter } from "next/navigation"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { useQueryClient } from "@tanstack/react-query"
import staff_queries from "@/features/staff/queries"
import staff_mutations from "@/features/staff/mutations"
import Staff_NotificationIdentifiers from "@/features/staff/notifications"
import staff_uri from "@/features/staff/uri"

function useStaff_notificationsRedirecter() {
   const router = useRouter()
   const queryClient = useQueryClient()

   const mutate_updateSeen = staff_mutations.notifications.seen({ showMessages: false })

   function handleRedirect(res: NotificationDto) {
      if (!res.seen) {
         mutate_updateSeen.mutate(
            { id: res.id },
            {
               onSuccess: async () => {
                  await queryClient.invalidateQueries({
                     queryKey: staff_queries.notifications.all.qk({}),
                  })
               },
            },
         )
      }

      switch (res.identifier) {
         case Staff_NotificationIdentifiers.TASK_ASSIGNED:
            router.push(staff_uri.navbar.tasks)
            break
      }
   }

   return handleRedirect
}

export default useStaff_notificationsRedirecter
