import type { Metadata, Viewport } from "next"
import { ReactNode } from "react"
import { Poppins, Roboto } from "next/font/google"
import GlobalProvider from "@/common/providers/global.provider"
import "@/app/globals.css"

const font = Roboto({
   subsets: ["latin", "vietnamese"],
   weight: ["300", "400", "500", "700", "900"],
   variable: "--font",
})

export const metadata: Metadata = {
   title: "App",
   description: "App",
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
            <GlobalProvider>{children}</GlobalProvider>
         </body>
      </html>
   )
}
