"use client"

import { ReactNode } from "react"
import MobileOnly from "@/common/components/MobileOnly"

export default function HeadStaffMobileLayout({ children }: { children: ReactNode }) {
   return <MobileOnly>{children}</MobileOnly>
}
