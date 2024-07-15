"use client"

import { Spin } from "antd"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isMobile } from "react-device-detect"

export default function StockkeeperPage() {
   const router = useRouter()

   useEffect(() => {
      if (isMobile) {
         router.push("/stockkeeper/mobile/dashboard")
      } else {
         router.push("/stockkeeper/desktop/dashboard")
      }
   }, [router])

   return <Spin fullscreen />
}
