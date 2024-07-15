import { ReactNode } from "react"
import StockkeeperNavbar from "../../_components/StockkeeperNavbar"

export default function NavbarTabs({ children }: { children: ReactNode }) {
   return (
      <div className="pb-24">
         {children}
         <StockkeeperNavbar />
      </div>
   )
}
