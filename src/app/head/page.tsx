"use client"

import { AntdRegistry } from "@ant-design/nextjs-registry";
import React from "react";
import ScanQR from "./_component/ScanQrScreen";
import ScanResults from "./_component/ScanResults";
import DashBoard from "./_component/DashBoard";

export default function HeadHomePage({ children }: Readonly<{ children: React.ReactNode }>) {
   return (
      <AntdRegistry>
         <DashBoard></DashBoard>
         {/* <ScanResults></ScanResults> */}
      </AntdRegistry>
   )
}
