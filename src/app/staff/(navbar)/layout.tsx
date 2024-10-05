import { ReactNode } from "react"
import StaffNavbar from "@/features/staff/components/StaffNavbar"

export default function StaffNavbarLayout({ children }: { children: ReactNode }) {
   return (
      <>
         <div className="h-max min-h-screen-with-navbar">{children}</div>
         <StaffNavbar />
      </>
   )
}
