import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import GlobalProvider from "@/common/providers/global.provider"
import { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
   title: "Rockstar App",
   description: "Rockstar App",
}

export default function RootLayout({
   children,
}: Readonly<{
   children: ReactNode
}>) {
   return (
      <html lang="en">
         <body className={inter.className}>
            <GlobalProvider>{children}</GlobalProvider>
         </body>
      </html>
   )
}
