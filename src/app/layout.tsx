import type { Metadata, Viewport } from "next"
import { ReactNode } from "react"
import { Inter } from "next/font/google"
import GlobalProvider from "@/common/providers/global.provider"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
   title: "Rockstar App",
   description: "Rockstar App",
}

// export const viewport: Viewport = {
//    width: "device-width",
//    initialScale: 1,
//    maximumScale: 1,
//    userScalable: false,
// }

export default function RootLayout({
   children,
}: Readonly<{
   children: ReactNode
}>) {
   return (
      <html lang="en">
         {/* <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
         </head> */}
         <body className={inter.className}>
            <GlobalProvider>{children}</GlobalProvider>
         </body>
      </html>
   )
}
