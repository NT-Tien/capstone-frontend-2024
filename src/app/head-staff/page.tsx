"use client"

import { Spin } from "antd"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isMobile } from "react-device-detect"

export default function HeadStaffPage() {
   const router = useRouter()

   useEffect(() => {
      router.push("/head-staff/mobile/dashboard")
   }, [router])

   return <Spin fullscreen />
}
