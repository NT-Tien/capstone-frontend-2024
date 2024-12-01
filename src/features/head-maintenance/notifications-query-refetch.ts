"use client"

import head_maintenance_queries from "@/features/head-maintenance/queries"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { NotificationType } from "@/lib/domain/Notification/NotificationType.enum"
import { QueryClient } from "@tanstack/react-query"

async function HM_Notifications_QueryRefetcher(n: NotificationDto, queryClient: QueryClient) {
   await queryClient.invalidateQueries({
      queryKey: ["global", "notifications"],
   })

   switch (n.type) {
      case NotificationType.HD_CREATE_REQUEST: {
         await queryClient.invalidateQueries({
            queryKey: ["head_maintenance", "request", "all"],
         })
         return
      }
   }
}

export { HM_Notifications_QueryRefetcher }
