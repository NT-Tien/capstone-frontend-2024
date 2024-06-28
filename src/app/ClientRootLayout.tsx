"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import GlobalProvider from "@/common/providers/global.provider";
import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from 'react-i18next';
import i18n from '@/config/i18n';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rockstar App",
  description: "Rockstar App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalProvider>
          {isClient ? (
            <I18nextProvider i18n={i18n}>
              {children}
            </I18nextProvider>
          ) : (
            children
          )}
        </GlobalProvider>
      </body>
    </html>
  );
}
