import { PropsWithChildren } from "react"
import type { Metadata } from "next"
import { generateTitle } from "@/lib/utils/generateTitle.util"

export const metadata: Metadata = {
   title: generateTitle("Đăng nhập"),
}

export default function Layout(props: PropsWithChildren) {
   return props.children
}
