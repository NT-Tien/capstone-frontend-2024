"use client"

import { AntdRegistry } from "@ant-design/nextjs-registry"
import React, { ReactNode } from "react"
import ScanQR from "./_component/ScanQrScreen"
import ScanResults from "./_component/ScanResults"
import DashBoard from "./_component/DashBoard"
import MobileNavBarTest from "@/common/components/MobileNavBarTest"

interface HeadHomePageProps {
   children?: ReactNode
}

const HeadHomePage: React.FC<HeadHomePageProps> = ({ children }) => {
   return (
      <AntdRegistry>
         <DashBoard>{children}</DashBoard>
      </AntdRegistry>
   )
}

export default HeadHomePage
