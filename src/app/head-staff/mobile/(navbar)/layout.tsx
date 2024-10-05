import { ReactNode } from "react"
import HeadStaffNavbar from "@/features/head-maintenance/components/layout/HeadStaffNavbar"

export default function NavbarTabs({ children }: { children: ReactNode }) {
   return (
      <>
         <div className="h-max min-h-screen-with-navbar">{children}</div>
         <HeadStaffNavbar />
      </>
   )
}
