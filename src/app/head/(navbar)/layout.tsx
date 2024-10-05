import { ReactNode } from "react"
import HeadNavbar from "@/features/head-department/components/layout/HeadNavbar"

export default function HeadNavbarLayout({ children }: { children: ReactNode }) {
   return (
      <>
         <div className="h-max min-h-screen-with-navbar">{children}</div>
         <HeadNavbar />
      </>
   )
}
