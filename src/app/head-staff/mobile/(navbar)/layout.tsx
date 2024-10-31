import { ReactNode } from "react"
import HeadMaintenanceNavigationDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"

export default function NavbarTabs({ children }: { children: ReactNode }) {
   return (
      <HeadMaintenanceNavigationDrawer>
         <div className="h-max min-h-screen-with-navbar">{children}</div>
      </HeadMaintenanceNavigationDrawer>
   )
}
