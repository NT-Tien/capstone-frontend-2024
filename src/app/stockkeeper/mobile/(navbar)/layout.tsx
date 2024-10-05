import { ReactNode } from "react"
import StockkeeperNavbar from "../../../../features/stockkeeper/components/StockkeeperNavbar"

export default function NavbarTabs({ children }: { children: ReactNode }) {
   return (
      <>
         <div className="h-max min-h-screen-with-navbar">{children}</div>
         <StockkeeperNavbar />
      </>
   )
}
