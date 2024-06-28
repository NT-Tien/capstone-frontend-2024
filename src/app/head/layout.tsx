import { ReactNode } from "react"
import MobileOnly from "@/common/components/MobileOnly"

export default function Layout({ children }: { children: ReactNode }) {
   return <MobileOnly>{children}</MobileOnly>
}