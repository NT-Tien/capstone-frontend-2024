import { ReactNode } from "react"
import HeadNavigationDrawer from "@/features/head-department/components/layout/HeadNavigationDrawer"

export default function HeadNavbarLayout({ children }: { children: ReactNode }) {
   return (
      <HeadNavigationDrawer>
         <div className="h-max min-h-screen-with-navbar">{children}</div>
      </HeadNavigationDrawer>
   )
}
