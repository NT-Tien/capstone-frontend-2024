"use client"

import hm_uris from "@/features/head-maintenance/uri"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { NotificationType } from "@/lib/domain/Notification/NotificationType.enum"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

function HM_Notifications_ClickHandler(dto: NotificationDto, router: AppRouterInstance) {
   switch (dto.type) {
      case NotificationType.HD_CREATE_REQUEST: {
         if (dto.subject) router.push(hm_uris.stack.requests_id(dto.subject))
         return
      }
      case NotificationType.STOCK_ACCEPT_EXPORT_WAREHOUSE: {
         if (dto.data.requestId) {
            router.push(hm_uris.stack.requests_id(dto.data.requestId))
         }
      }
      case NotificationType.S_COMPLETE_ALL_TASKS: {
         if (dto.subject) router.push(hm_uris.stack.requests_id(dto.subject))
         return
      }
   }
}

export default HM_Notifications_ClickHandler
