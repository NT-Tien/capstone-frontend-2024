"use client"

import { Spin } from "antd"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function StockkeeperPage() {
   const router = useRouter()

   useEffect(() => {
      router.push("/stockkeeper/mobile/dashboard")
   }, [router])

   return <Spin fullscreen />
}
