import { ReactNode } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
   title: "Lịch sử | Head",
}

export default function Layout({ children }: { children: ReactNode }) {
   return children
}
