import { ReactNode } from "react"
import HeadNavbar from "@/app/head/_components/HeadNavbar"

export default function HeadNavbarLayout({ children }: { children: ReactNode }) {
   return (
      <div className="pb-28">
         {children}
         <HeadNavbar />
      </div>
   )
}
