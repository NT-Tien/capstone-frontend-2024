"use client"

import MobileBottomNavbar, { NavbarMenuItem } from "@/components/layout/MobileBottomNavbar"
import { CheckOutlined, ContainerFilled, HomeFilled, SettingOutlined } from "@ant-design/icons"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function StaffNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState("dashboard")

   function handleClick(path: string) {
      setCurrentActive(path)
   }

   useEffect(() => {
      setCurrentActive(current.split("/")[2])
   }, [current])

   const items: NavbarMenuItem[] = [
      {
         name: "",
         key: "dashboard",
         icon: <HomeFilled />,
         href: "/staff/dashboard",
         onClick: () => handleClick("dashboard"),
      },
      {
         name: "",
         key: "tasks",
         icon: <ContainerFilled />,
         href: "/staff/tasks",
         onClick: () => handleClick("tasks"),
      },
      {
         name: "",
         key: "map",
         icon: <CheckOutlined />,
         href: "/staff/map",
         onClick: () => handleClick("map"),
      },
      {
         name: "",
         key: "profile",
         icon: <SettingOutlined />,
         href: "/staff/profile",
         onClick: () => handleClick("profile"),
      },
   ]

   return <MobileBottomNavbar items={items} currentActive={currentActive} />
}
