"use client"

import { ReactNode, useEffect, useState } from "react"
import { ConfigProvider } from "antd-mobile"
import enUS from "antd-mobile/es/locales/en-US"
import MobileOnly from "@/common/components/MobileOnly"

export default function HeadStaffLayout({ children }: { children: ReactNode }) {
   return <MobileOnly>{children}</MobileOnly>
}
