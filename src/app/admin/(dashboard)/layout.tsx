import { ReactNode } from "react"
import dynamic from "next/dynamic"
import SuperUserDrawerProvider from "@/providers/SuperUserDrawer.provider"
// import RightNavbar from "@/features/admin/components/layout/RightNavbar"

const RightNavbar = dynamic(() => import("@/features/admin/components/layout/RightNavbar"), {
   ssr: false,
})

function Layout({ children }: { children: ReactNode }) {
   return (
      <SuperUserDrawerProvider>
         <RightNavbar>{children}</RightNavbar>
      </SuperUserDrawerProvider>
   )
}

export default Layout
