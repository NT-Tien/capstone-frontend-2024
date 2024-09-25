import { ReactNode } from "react"
import { Metadata } from "next"
import ClientOnlyWrapper from "../../../../../providers/ClientOnlyWrapper"

export const metadata: Metadata = {
   title: "Dashboard | Head Staff",
}

export default function Layout({ children }: { children: ReactNode }) {
   return <ClientOnlyWrapper>{children}</ClientOnlyWrapper>
}
