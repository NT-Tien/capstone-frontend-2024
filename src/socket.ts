"use client"

import { io, Socket } from "socket.io-client"
import { clientEnv } from "@/env"

const sockets: {
   [key: string]: Socket
} = {}

const getSocket = (role: string, token: string) => {
   console.log(`Connecting to socket: ${clientEnv.WEBSOCKET_URL + `/${role}`}`)
   if (!sockets[role]) {
      console.log("SOCKET: Cache miss")
      sockets[role] = io(clientEnv.WEBSOCKET_URL + `/${role}`, {
         extraHeaders: {
            "x-auth-token": token,
         },
      })
   }
   return sockets[role]
}

export default getSocket
