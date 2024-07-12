import type { Metadata, Viewport } from "next"
import { ReactNode } from "react"
import { Inter } from "next/font/google"
import GlobalProvider from "@/common/providers/global.provider"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })
export const viewport: Viewport = {
   initialScale: 1.0,
   width: "device-width",
}

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
