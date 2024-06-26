"use client"

import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { App } from "antd"

export default function useLogout() {
   const router = useRouter()
   const { message } = App.useApp()

   async function logout() {
      Cookies.remove("token")
      message.success("Logout successful")
      router.push("/login")
   }

   return [logout]
}
