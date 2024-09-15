import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Công cụ | Stockkeeper",
 }

function Layout({children}: {children: ReactNode}) {
    return children
}

export default Layout