import type { Metadata } from "next";
import { ReactNode } from "react";
import ClientRootLayout from './ClientRootLayout';

export const metadata: Metadata = {
  title: "Rockstar App",
  description: "Rockstar App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ClientRootLayout>
      {children}
    </ClientRootLayout>
  );
}
