import useCurrentToken from "@/lib/hooks/useCurrentToken"
import { useEffect, useState } from "react"
import getSocket from "@/socket"
import { Role } from "@/lib/domain/User/role.enum"

type Props = {
   role: Role
}

function useNotifications(props: Props) {
   const [isConnected, setIsConnected] = useState<boolean>(false)
   const currentToken = useCurrentToken()

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

      if (!currentToken) {
         console.log("NO TOKEN")
      }
      const socket = getSocket(props.role, currentToken ?? "")

      socket.on("connect", onConnect)
      socket.on("disconnect", onDisconnect)
      socket.on("dev", onDev)

      return () => {
         socket.off("connect", onConnect)
         socket.off("disconnect", onDisconnect)
         socket.off("dev", onDev)
         socket.disconnect()
      }
   }, [props.role, currentToken])
}

export default useNotifications
