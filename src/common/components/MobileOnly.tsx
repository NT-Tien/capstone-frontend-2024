"use client"

import { ReactNode, useEffect, useState } from "react"
import { Spin } from "antd"
import { isMobile } from "react-device-detect"

export default function MobileOnly({ children }: { children: ReactNode }) {
   const [isCurrentMobile, setIsCurrentMobile] = useState<boolean | undefined>(undefined)

   useEffect(() => {
      function handleResize() {
         if (isMobile) setIsCurrentMobile(true)
         else setIsCurrentMobile(false)
      }

      handleResize()

      window.addEventListener("resize", handleResize)

      return () => window.removeEventListener("resize", handleResize)
   }, [])

   if (isCurrentMobile === undefined) return <Spin fullscreen={true} />
   if (isCurrentMobile) return children
   else
      return (
         <div className="text-2xl grid h-screen w-full place-content-center font-bold">
            Please open this app on a mobile device
         </div>
      )
}
