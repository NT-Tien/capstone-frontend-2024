import { ReactNode } from "react"
import HeadMaintenanceNavigaionDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"

export default function NavbarTabs({ children }: { children: ReactNode }) {
   return (
      <HeadMaintenanceNavigaionDrawer>
         <div className="h-max min-h-screen-with-navbar">{children}</div>
      </HeadMaintenanceNavigaionDrawer>
   )
}
