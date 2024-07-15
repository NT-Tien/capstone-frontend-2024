"use client"
import MobileOnly from "@/common/components/MobileOnly"
import { ReactNode } from "react"

export default function StockKeeperLayout({ children }: { children: ReactNode }) {
   return <MobileOnly>{children}</MobileOnly>
}
