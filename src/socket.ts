"use client"

import { io } from "socket.io-client"

export const socket = (role: string, token: string) => {
   return io(`http://192.168.72.37:8080/socket/${role}`, {
      extraHeaders: {
         "x-auth-token": token,
      },
   })
}
