"use client"

import { ReactNode, useEffect, useState } from "react"
import { ConfigProvider } from "antd-mobile"
import enUS from "antd-mobile/es/locales/en-US"

export default function MobileOnly({ children }: { children: ReactNode }) {
   const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

   useEffect(() => {
      function handleResize() {
         if (window.innerWidth <= 1024) setIsMobile(true)
         else setIsMobile(false)
      }

      handleResize()

      window.addEventListener("resize", handleResize)

      return () => window.removeEventListener("resize", handleResize)
   }, [])

   if (isMobile === undefined) return null
   if (isMobile) return <ConfigProvider locale={enUS}>{children}</ConfigProvider>
   else
      return (
         <div className="grid h-screen w-full place-content-center text-2xl font-bold">
            Please open this app on a mobile device
         </div>
      )
}