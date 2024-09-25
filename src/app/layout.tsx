import "@/app/globals.css"
import IndexProvider from "@/provider"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ReactNode } from "react"
import AppConsts from "@/lib/constants/AppConsts"

const font = Inter({
   subsets: ["latin", "vietnamese"],
   weight: ["300", "400", "500", "700", "900"],
   variable: "--font",
})

export const metadata: Metadata = {
   title: AppConsts.name,
}

export const viewport: Viewport = {
   width: "device-width",
   initialScale: 1,
   maximumScale: 1,
   userScalable: false,
}

export default function RootLayout({
   children,
}: Readonly<{
   children: ReactNode
}>) {
   return (
      <html lang="en">
         <body className={`${font.variable} antialiased`}>
            <IndexProvider>{children}</IndexProvider>
         </body>
      </html>
   )
}
