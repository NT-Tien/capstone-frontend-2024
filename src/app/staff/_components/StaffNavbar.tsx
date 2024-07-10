"use client"

import { useEffect, useState } from "react"
import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavbar"
import { CheckOutlined, ContainerFilled, DashboardFilled, EllipsisOutlined, UserOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { TeamFill } from "antd-mobile-icons"
import { useTranslation } from "react-i18next"

export default function StaffNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const router = useRouter()
   const { t } = useTranslation()

   useEffect(() => {
      setCurrentActive(current.split("/")[2])
   }, [current])

   useEffect(() => {
      if (currentActive) router.push(`/staff/${currentActive}`)
   }, [currentActive, router])

   const items: NavbarMenuItem[] = [
      {
         name: "Dashboard",
         key: "dashboard",
         icon: <DashboardFilled />,
         onClick: () => setCurrentActive("dashboard"),
      },
      {
         name: "Task List",
         key: "tasks",
         icon: <ContainerFilled />,
         onClick: () => setCurrentActive("tasks"),
      },
      {
         name: "Device Map",
         key: "map",
         icon: <CheckOutlined />,
         onClick: () => setCurrentActive("map"),
      },
      {
         name: t("Profile"),
         key: "profile",
         icon: <EllipsisOutlined />,
         onClick: () => setCurrentActive("profile"),
      },
   ]

   return <MobileNavbar items={items} currentActive={currentActive} />
}
