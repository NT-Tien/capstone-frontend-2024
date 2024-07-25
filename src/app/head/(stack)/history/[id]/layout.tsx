import { ReactNode } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
   title: "Thông tin báo cáo | Head",
}

export default function Layout({ children }: { children: ReactNode }) {
   return children
}
