"use client"

import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavbar"
import { CheckOutlined, ContainerFilled, DashboardFilled, EllipsisOutlined } from "@ant-design/icons"
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
         name: "Trang chủ",
         key: "dashboard",
         icon: <DashboardFilled />,
         href: "/staff/dashboard",
         onClick: () => handleClick("dashboard"),
      },
      {
         name: "Tác vụ",
         key: "tasks",
         icon: <ContainerFilled />,
         href: "/staff/tasks",
         onClick: () => handleClick("tasks"),
      },
      {
         name: "Bản đồ",
         key: "map",
         icon: <CheckOutlined />,
         href: "/staff/map",
         onClick: () => handleClick("map"),
      },
      {
         name: "Hồ sơ",
         key: "profile",
         icon: <EllipsisOutlined />,
         href: "/staff/profile",
         onClick: () => handleClick("profile"),
      },
   ]

   return <MobileNavbar items={items} currentActive={currentActive} />
}
