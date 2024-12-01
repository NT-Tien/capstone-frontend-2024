"use client"

import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { NotificationType } from "@/lib/domain/Notification/NotificationType.enum"
import { QueryClient } from "@tanstack/react-query"

async function S_Notifications_QueryRefetcher(n: NotificationDto, queryClient: QueryClient) {
   await queryClient.invalidateQueries({
      queryKey: ["global", "notifications"],
   })

   switch (n.type) {
      case NotificationType.HM_ASSIGN_TASK: {
         await queryClient.invalidateQueries({
            queryKey: ["staff", "task", "all-by-date"],
         })
         return
      }
   }
}

export { S_Notifications_QueryRefetcher }
