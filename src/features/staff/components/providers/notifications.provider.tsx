"use client"

import { S_Notifications_QueryRefetcher } from "@/features/staff/notifications-query-refetch"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { NotificationPriority } from "@/lib/domain/Notification/NotificationPriority.enum"
import { decodeJwt } from "@/lib/domain/User/decodeJwt.util"
import { Role } from "@/lib/domain/User/role.enum"
import useCurrentToken from "@/lib/hooks/useCurrentToken"
import useSystemNotification from "@/lib/hooks/useSystemNotification"
import getSocket from "@/socket"
import { useQueryClient } from "@tanstack/react-query"
import { createContext, PropsWithChildren, useEffect, useState } from "react"

type NotificationsContextType = {}
const NotificationsContext = createContext<NotificationsContextType | null>(null)

function Staff_NotificationsProvider(props: PropsWithChildren) {
   const [isConnected, setIsConnected] = useState<boolean>(false)
   const currentToken = useCurrentToken()
   const queryClient = useQueryClient()
   const send = useSystemNotification()

   useEffect(() => {
      function onConnect() {
         setIsConnected(true)
         console.log("CONNECTED TO STAFF")
      }

      function onDisconnect() {
         setIsConnected(false)
         console.log("DISCONNECTED FROM STAFF")
      }

      function onDev(value: string) {
         console.log("DEV", value)
      }

      function onReceive(data: NotificationDto) {
         console.log("Notifications Ping")
         send({
            title: data.title,
            body: data.body,
            data: data.data,
            silent: data.priority !== NotificationPriority.HIGH,
         })
         S_Notifications_QueryRefetcher(data, queryClient)
      }

      if (!currentToken) {
         return
      }
      const socket = getSocket(Role.staff, currentToken)
      const decodedToken = decodeJwt(currentToken)

      socket.on("connect", onConnect)
      socket.on("disconnect", onDisconnect)
      socket.on(decodedToken.id, onReceive)
      socket.on("dev", onDev)

      return () => {
         socket.off("connect", onConnect)
         socket.off("disconnect", onDisconnect)
         socket.off("dev", onDev)
         socket.off(decodedToken.id, onReceive)
         socket.disconnect()
      }
   }, [currentToken, queryClient])

   return <NotificationsContext.Provider value={{}}>{props.children}</NotificationsContext.Provider>
}

export default Staff_NotificationsProvider
