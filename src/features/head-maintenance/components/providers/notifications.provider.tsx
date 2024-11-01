"use client"

import { createContext, PropsWithChildren, useEffect, useState } from "react"
import getSocket from "@/socket"
import { Role } from "@/lib/domain/User/role.enum"
import useCurrentToken from "@/lib/hooks/useCurrentToken"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { useQueryClient } from "@tanstack/react-query"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { decodeJwt } from "@/lib/domain/User/decodeJwt.util"

type NotificationsContextType = {}
const NotificationsContext = createContext<NotificationsContextType | null>(null)

function HeadMaintenance_NotificationsProvider(props: PropsWithChildren) {
   const [isConnected, setIsConnected] = useState<boolean>(false)
   const currentToken = useCurrentToken()
   const queryClient = useQueryClient()

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

      async function onRequestCreate(res: NotificationDto) {
         await queryClient.invalidateQueries({
            queryKey: head_maintenance_queries.notifications.all.qk({}),
         })
      }

      if (!currentToken) {
         return
      }
      const socket = getSocket(Role.headstaff, currentToken)
      const decodedToken = decodeJwt(currentToken)

      socket.on("connect", onConnect)
      socket.on("disconnect", onDisconnect)
      socket.on("dev", onDev)
      socket.on(decodedToken.id, onRequestCreate)

      return () => {
         socket.off("connect", onConnect)
         socket.off("disconnect", onDisconnect)
         socket.off("dev", onDev)
         socket.off(decodedToken.id, onRequestCreate)
         socket.disconnect()
      }
   }, [currentToken, queryClient])

   return <NotificationsContext.Provider value={{}}>{props.children}</NotificationsContext.Provider>
}

export default HeadMaintenance_NotificationsProvider
