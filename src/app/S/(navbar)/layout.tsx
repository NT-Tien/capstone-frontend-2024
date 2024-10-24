import { ReactNode } from "react"
import StaffNavigationDrawer from "@/features/staff/components/layout/StaffNavigationDrawer"

export default function StaffNavbarLayout({ children }: { children: ReactNode }) {
   return (
      <StaffNavigationDrawer>
         <div className="h-max min-h-screen-with-navbar">{children}</div>
      </StaffNavigationDrawer>
   )
}
