"use client"

import { UnauthorizedError } from "@/lib/error/unauthorized.error"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Spin } from "antd"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
   const router = useRouter()

   useEffect(() => {
      if (error instanceof UnauthorizedError) {
         router.push("/login?error=unauthenticated")
      }
   }, [error, router])

   return <Spin fullscreen={true} />
}
