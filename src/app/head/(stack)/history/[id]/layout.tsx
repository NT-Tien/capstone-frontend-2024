import { ReactNode } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
   title: "Request Details | Head",
}

export default function Layout({ children }: { children: ReactNode }) {
   return children
}
