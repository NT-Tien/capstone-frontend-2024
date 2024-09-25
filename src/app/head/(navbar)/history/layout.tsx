import { ReactNode } from "react"
import { Metadata } from "next"
import { generateTitle } from "@/lib/utils/generateTitle.util"

export const metadata: Metadata = {
   title: generateTitle("Lịch sử"),
}

export default function Layout({ children }: { children: ReactNode }) {
   return children
}
