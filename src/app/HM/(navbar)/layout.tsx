import { PropsWithChildren } from "react"
import HeadMaintenanceNavigationDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"

function Layout({ children }: PropsWithChildren) {
   return (
      <HeadMaintenanceNavigationDrawer>
         <div className="h-max min-h-screen-with-navbar">{children}</div>
      </HeadMaintenanceNavigationDrawer>
   )
}

export default Layout
