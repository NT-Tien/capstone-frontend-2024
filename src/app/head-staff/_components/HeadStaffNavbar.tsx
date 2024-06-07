"use client"

import { useEffect, useState } from "react"
import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavbar"
import { ContainerFilled, DashboardFilled, UserOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { TeamFill } from "antd-mobile-icons"

export default function HeadStaffNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const router = useRouter()

   useEffect(() => {
      setCurrentActive(current.split("/")[2])
   }, [current])

   useEffect(() => {
      if (currentActive) router.push(`/head-staff/${currentActive}`)
   }, [currentActive, router])

   const items: NavbarMenuItem[] = [
      {
         name: "Dashboard",
         key: "dashboard",
         icon: <DashboardFilled />,
         onClick: () => setCurrentActive("dashboard"),
      },
      {
         name: "Reports",
         key: "reports",
         icon: <ContainerFilled />,
         onClick: () => setCurrentActive("reports"),
      },
      {
         name: "Staff",
         key: "staff",
         icon: <TeamFill />,
         onClick: () => setCurrentActive("staff"),
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
