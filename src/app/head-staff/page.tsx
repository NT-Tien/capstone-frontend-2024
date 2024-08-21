"use client"

import { Spin } from "antd"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HeadStaffPage() {
   const router = useRouter()

   useEffect(() => {
      router.push("/head-staff/mobile/dashboard")
   }, [router])

   return <Spin fullscreen />
}
