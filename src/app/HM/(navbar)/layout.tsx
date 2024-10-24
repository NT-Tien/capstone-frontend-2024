import { PropsWithChildren } from "react"
import HeadMaintenanceNavigaionDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"

function Layout({ children }: PropsWithChildren) {
   return (
      <HeadMaintenanceNavigaionDrawer>
         <div className="h-max min-h-screen-with-navbar">{children}</div>
      </HeadMaintenanceNavigaionDrawer>
   )
}

export default Layout
