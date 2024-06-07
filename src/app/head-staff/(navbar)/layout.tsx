import { ReactNode } from "react"
import HeadStaffNavbar from "@/app/head-staff/_components/HeadStaffNavbar"

export default function NavbarTabs({ children }: { children: ReactNode }) {
   return (
      <div className="pb-24">
         {children}
         <HeadStaffNavbar />
      </div>
   )
}
