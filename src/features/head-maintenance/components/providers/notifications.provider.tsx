"use client"

import HM_Notifications_ClickHandler from "@/features/head-maintenance/notifications-handler"
import { HM_Notifications_QueryRefetcher } from "@/features/head-maintenance/notifications-query-refetch"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { NotificationPriority } from "@/lib/domain/Notification/NotificationPriority.enum"
import { decodeJwt } from "@/lib/domain/User/decodeJwt.util"
import { Role } from "@/lib/domain/User/role.enum"
import useCurrentToken from "@/lib/hooks/useCurrentToken"
import useSystemNotification from "@/lib/hooks/useSystemNotification"
import getSocket from "@/socket"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { createContext, PropsWithChildren, useEffect, useState } from "react"

type NotificationsContextType = {}
const NotificationsContext = createContext<NotificationsContextType | null>(null)

function HeadMaintenance_NotificationsProvider(props: PropsWithChildren) {
   const [isConnected, setIsConnected] = useState<boolean>(false)
   const currentToken = useCurrentToken()
   const queryClient = useQueryClient()
   const send = useSystemNotification()
   const router = useRouter()

   useEffect(() => {
      function onConnect() {
         setIsConnected(true)
         console.log("CONNECTED TO HEAD_STAFF")
      }

      function onDisconnect() {
         setIsConnected(false)
         console.log("DISCONNECTED FROM HEAD_STAFF")
      }

      function onDev(value: string) {
         console.log("DEV", value)
      }

      function onReceive(data: NotificationDto) {
         send({
            title: data.title,
            body: data.body,
            data: data.data,
            silent: data.priority !== NotificationPriority.HIGH,
            onClick: () => HM_Notifications_ClickHandler(data, router),
         })
         HM_Notifications_QueryRefetcher(data, queryClient)
      }

      if (!currentToken) {
         return
      }
      const socket = getSocket(Role.headstaff, currentToken)
      const decodedToken = decodeJwt(currentToken)

      socket.on("connect", onConnect)
      socket.on("disconnect", onDisconnect)
      socket.on(decodedToken.id, onReceive)
      socket.on("dev", onDev)

      return () => {
         socket.off("connect", onConnect)
         socket.off("disconnect", onDisconnect)
         socket.off(decodedToken.id, onReceive)
         socket.off("dev", onDev)
         socket.disconnect()
      }
   }, [currentToken, queryClient, router, send])

   return <NotificationsContext.Provider value={{}}>{props.children}</NotificationsContext.Provider>
}

export default HeadMaintenance_NotificationsProvider
