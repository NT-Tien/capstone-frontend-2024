import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Format from "./components/format";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Rockstar ADMIN",
    description: "Rockstar App",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className} style={{ padding: 0, margin: 0}}>
                <AntdRegistry>
                    <Format>
                        {children}
                    </Format>
                </AntdRegistry>
            </body>
        </html>
    );
}
