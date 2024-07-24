"use client"

import { useEffect, useState } from "react"
import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavbar"
import { CheckOutlined, ContainerFilled, DashboardFilled, EllipsisOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"

export default function HeadStaffNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const { t } = useTranslation()

   function handleClick(path: string) {
      setCurrentActive(path)
   }

   useEffect(() => {
      setCurrentActive(current.split("/")[3])
   }, [current])

   const items: NavbarMenuItem[] = [
      {
         name: "Trang chủ",
         key: "dashboard",
         icon: <DashboardFilled />,
         href: "/head-staff/mobile/dashboard",
         onClick: () => handleClick("dashboard"),
      },
      {
         name: "Yêu cầu",
         key: "requests",
         icon: <ContainerFilled />,
         href: "/head-staff/mobile/requests",
         onClick: () => handleClick("requests"),
      },
      {
         name: "Tác vụ",
         key: "tasks",
         icon: <CheckOutlined />,
         href: "/head-staff/mobile/tasks",
         onClick: () => handleClick("tasks"),
      },
      {
         name: "Hồ sơ",
         key: "profile",
         icon: <EllipsisOutlined />,
         href: "/head-staff/mobile/profile",
         onClick: () => handleClick("profile"),
      },
   ]

   return <MobileNavbar items={items} currentActive={currentActive} />
}
