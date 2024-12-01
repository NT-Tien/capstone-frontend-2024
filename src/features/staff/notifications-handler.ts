"use client"

import staff_uri from "@/features/staff/uri"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { NotificationType } from "@/lib/domain/Notification/NotificationType.enum"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

function S_Notifications_ClickHandler(dto: NotificationDto, router: AppRouterInstance) {
   switch (dto.type) {
      case NotificationType.HM_ASSIGN_TASK: {
         if (dto.subject) {
            router.push(staff_uri.navbar.tasks)
         }
         return
      }
   }
}

export default S_Notifications_ClickHandler
