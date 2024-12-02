"use client"

import { createContext, PropsWithChildren, useEffect, useState } from "react"
import getSocket from "@/socket"
import { Role } from "@/lib/domain/User/role.enum"
import useCurrentToken from "@/lib/hooks/useCurrentToken"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { useQueryClient } from "@tanstack/react-query"
import { decodeJwt } from "@/lib/domain/User/decodeJwt.util"
import staff_queries from "@/features/staff/queries"

type NotificationsContextType = {}
const NotificationsContext = createContext<NotificationsContextType | null>(null)

function Staff_NotificationsProvider(props: PropsWithChildren) {
   const [isConnected, setIsConnected] = useState<boolean>(false)
   const currentToken = useCurrentToken()
   const queryClient = useQueryClient()

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

      if (!currentToken) {
         return
      }
      const socket = getSocket(Role.staff, currentToken)
      const decodedToken = decodeJwt(currentToken)

      socket.on("connect", onConnect)
      socket.on("disconnect", onDisconnect)
      socket.on("dev", onDev)

      return () => {
         socket.off("connect", onConnect)
         socket.off("disconnect", onDisconnect)
         socket.off("dev", onDev)
         socket.disconnect()
      }
   }, [currentToken, queryClient])

   return <NotificationsContext.Provider value={{}}>{props.children}</NotificationsContext.Provider>
}

export default Staff_NotificationsProvider
