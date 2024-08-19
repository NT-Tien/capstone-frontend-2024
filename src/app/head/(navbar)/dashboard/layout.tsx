import { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
   title: "Trang chủ | Head",
}

export default function Layout({ children }: { children: ReactNode }) {
   return children
}
