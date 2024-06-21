"use client"

import { useEffect, useState } from "react"
import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavBar"
import { DashboardFilled, UserOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { ClockCircleOutline, SystemQRcodeOutline } from "antd-mobile-icons"

export default function HeadNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const router = useRouter()

   useEffect(() => {
      setCurrentActive(current.split("/")[2])
   }, [current])

   useEffect(() => {
      if (currentActive) router.push(`/head/${currentActive}`)
   }, [currentActive, router])

   const items: NavbarMenuItem[] = [
      {
         name: "Dashboard",
         key: "dashboard",
         icon: <DashboardFilled />,
         onClick: () => setCurrentActive("dashboard"),
      },
      {
         name: "Scan",
         key: "scan",
         icon: <SystemQRcodeOutline />,
         onClick: () => setCurrentActive("scan"),
      },
      {
         name: "History",
         key: "history",
         icon: <ClockCircleOutline />,
         onClick: () => setCurrentActive("history"),
      },
      {
         name: "Profile",
         key: "profile",
         icon: <UserOutlined />,
         onClick: () => setCurrentActive("profile"),
      },
   ]

   return <MobileNavbar items={items} currentActive={currentActive} />
}
