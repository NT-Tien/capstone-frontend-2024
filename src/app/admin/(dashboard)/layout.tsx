import { ReactNode } from "react"
import dynamic from "next/dynamic"
// import RightNavbar from "@/features/admin/components/layout/RightNavbar"

const RightNavbar = dynamic(() => import("@/features/admin/components/layout/RightNavbar"), {
   ssr: false,
})

function Layout({ children }: { children: ReactNode }) {
   return <RightNavbar>{children}</RightNavbar>
}

export default Layout
