import { ReactNode } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
   title: "Thông tin yêu cầu | Head Staff",
}

export default function Layout({ children }: { children: ReactNode }) {
   return children
}
