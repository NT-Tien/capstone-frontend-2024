"use client"

import { Spin } from "antd"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isMobile } from "react-device-detect"

export default function HeadStaffPage() {
   const router = useRouter()

   useEffect(() => {
      if (isMobile) {
         router.push("/head-staff/mobile/dashboard")
      } else {
         router.push("/head-staff/desktop")
      }
   }, [router])

   return <Spin fullscreen />
}
