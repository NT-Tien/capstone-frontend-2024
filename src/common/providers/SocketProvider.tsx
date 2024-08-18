"use client"

import { createContext, ReactNode, useEffect, useState } from "react"
import { socket } from "@/socket"
import { App } from "antd"
import { Socket } from "socket.io-client"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

type Props = {
   role: string
}

type SocketContextType = {
   socket: Socket
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined)

export default function SocketProvider({ children, ...props }: { children: ReactNode } & Props) {
   const { message } = App.useApp()
   const router = useRouter()
   const [currentSocket, setCurrentSocket] = useState<Socket>()

   useEffect(() => {
      const token = Cookies.get("token")
      if (!token) {
         router.push("/login")
         return
      }
      setCurrentSocket(socket(props.role, token))
   }, [props.role, router])

   useEffect(() => {
      if (!currentSocket) return

      if (currentSocket.connected) {
         onConnect().then()
      }

      async function onConnect() {
         if (!currentSocket) return
         message.destroy("msg")
         message.destroy("msg-2")
         message.info({
            content: `Connected to the socket server`,
            key: "msg",
            duration: 5,
         })

         currentSocket.io.engine.on("upgrade", (transport) => {
            // message.success({
            //    content: `Upgraded to ${transport.name}`,
            //    key: "msg-2",
            // })
         })
      }

      async function onDisconnect() {
         message.destroy("msg")
         message.destroy("msg-2")
         message.info({
            content: "Disconnected from the socket server",
            key: "msg",
         })
      }

      currentSocket.on("connect", onConnect)
      currentSocket.on("disconnect", onDisconnect)

      currentSocket.on("error", (error) => {
         console.error("Socket error", error)
      })

      return () => {
         currentSocket.off("connect", onConnect)
         currentSocket.off("disconnect", onDisconnect)
      }
   }, [currentSocket, message])

   if (!currentSocket) return children

   return <SocketContext.Provider value={{ socket: currentSocket }}>{children}</SocketContext.Provider>
}
