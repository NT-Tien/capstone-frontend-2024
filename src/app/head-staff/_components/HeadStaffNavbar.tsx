"use client"

import MobileBottomNavbar, { NavbarMenuItem } from "@/components/layout/MobileBottomNavbar"
import { CheckOutlined, ContainerFilled, HomeFilled, SettingOutlined } from "@ant-design/icons"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function HeadStaffNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()

   function handleClick(path: string) {
      setCurrentActive(path)
   }

   useEffect(() => {
      setCurrentActive(current.split("/")[3])
   }, [current])

   const items: NavbarMenuItem[] = [
      {
         name: "",
         key: "dashboard",
         icon: <HomeFilled />,
         href: "/head-staff/mobile/dashboard",
         onClick: () => handleClick("dashboard"),
      },
      {
         name: "",
         key: "requests",
         icon: <ContainerFilled />,
         href: "/head-staff/mobile/requests",
         onClick: () => handleClick("requests"),
      },
      {
         name: "",
         key: "tasks",
         icon: <CheckOutlined />,
         href: "/head-staff/mobile/tasks",
         onClick: () => handleClick("tasks"),
      },
      {
         name: "",
         key: "profile",
         icon: <SettingOutlined />,
         href: "/head-staff/mobile/profile",
         onClick: () => handleClick("profile"),
      },
   ]

   return <MobileBottomNavbar items={items} currentActive={currentActive} />
}
