"use client"

import Cookies from "js-cookie"
import { decodeJwt } from "@/lib/domain/User/decodeJwt.util"
import useLogout from "@/lib/domain/User/useLogout"
import { JwtToken } from "@/lib/domain/User/JwtToken"

export default function useCurrentUser(): JwtToken {
   const token = Cookies.get("token")
   const [logout] = useLogout()
   if (!token) {
      logout().then()
      return {} as JwtToken // placeholder
   } else {
      return decodeJwt(token)
   }
}
