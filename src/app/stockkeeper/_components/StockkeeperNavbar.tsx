"use client"

import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavbar"
import { ContainerFilled, DashboardFilled, EllipsisOutlined, ScanOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function StockkeeperNavbar() {
   const pathname = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const router = useRouter()

   useEffect(() => {
      setCurrentActive(pathname.split("/")[3])
   }, [pathname])

   useEffect(() => {
      if (currentActive) router.push(`/stockkeeper/mobile/${currentActive}`)
   }, [currentActive, router])

   const items: NavbarMenuItem[] = [
      {
         name: "Trang chủ",
         key: "dashboard",
         icon: <DashboardFilled />,
         onClick: () => setCurrentActive("dashboard"),
      },
      {
         name: "Kho máy",
         key: "warehouse",
         icon: <ContainerFilled />,
         onClick: () => setCurrentActive("warehouse"),
      },
      {
         name: "Quét QR",
         key: "scan",
         icon: <ScanOutlined />,
         onClick: () => setCurrentActive("scan"),
      },
      {
         name: "Hồ sơ",
         key: "profile",
         icon: <EllipsisOutlined />,
         onClick: () => setCurrentActive("profile"),
      },
   ]

   return <MobileNavbar items={items} currentActive={currentActive} />
}
