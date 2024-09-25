import { Metadata } from "next"
import { ReactNode } from "react"
import { generateTitle } from "@/lib/utils/generateTitle.util"

export const metadata: Metadata = {
   title: generateTitle("Thống kê"),
}

export default function Layout({ children }: { children: ReactNode }) {
   return children
}
