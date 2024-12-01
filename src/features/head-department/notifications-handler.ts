"use client"

import hd_uris from "@/features/head-department/uri"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { NotificationType } from "@/lib/domain/Notification/NotificationType.enum"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

function HD_Notifications_ClickHandler(dto: NotificationDto, router: AppRouterInstance) {
   switch (dto.type) {
      case NotificationType.HM_APPROVE_REQUEST_FIX: 
      case NotificationType.HM_APPROVE_REQUEST_WARRANTY: 
      case NotificationType.HM_APPROVE_REQUEST_RENEW: 
      case NotificationType.HM_REJECT_REQUEST: {
         if (dto.subject) router.push(hd_uris.stack.history_id(dto.subject))
         return
      }
   }
}

export default HD_Notifications_ClickHandler
