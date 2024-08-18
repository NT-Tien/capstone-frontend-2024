"use client"

import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { App } from "antd"
import { useQueryClient } from "@tanstack/react-query"

export default function useLogout() {
   const router = useRouter()
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   async function logout() {
      localStorage.removeItem("staff-task")
      localStorage.removeItem("scanned-cache-headstaff")
      Cookies.remove("token")
      message.success("Đăng xuất thành công")
      queryClient.clear()
      router.push("/login")
   }

   return [logout]
}
