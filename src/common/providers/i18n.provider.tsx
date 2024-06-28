"use client"

import { ReactNode, useEffect, useState } from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/config/i18n"

export default function I18NProvider({ children }: { children: ReactNode }) {
   const [isClient, setIsClient] = useState(false)

   useEffect(() => {
      setIsClient(true)
   }, [])

   if (!isClient) return children

   return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
