import { ReactNode } from "react"
import { Metadata } from "next"
import SocketProvider from "@/common/providers/SocketProvider"

export const metadata: Metadata = {
   title: "Trang chủ | Head",
}

export default function Layout({ children }: { children: ReactNode }) {
   return <SocketProvider role="head">{children}</SocketProvider>
}
