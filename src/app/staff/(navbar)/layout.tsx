import { ReactNode } from "react"
import StaffNavbar from "@/app/staff/_components/StaffNavbar"

export default function StaffNavbarLayout({ children }: { children: ReactNode }) {
   return (
      <div className="h-full pb-24">
         {children}
         <StaffNavbar />
      </div>
   )
}
