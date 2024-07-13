"use client"

import { useEffect, useState } from "react"
import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavbar"
import { CheckOutlined, ContainerFilled, DashboardFilled, EllipsisOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"

export default function HeadStaffNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const router = useRouter()
   const { t } = useTranslation()

   function handleClick(path: string) {
      setCurrentActive(path)
      router.push(`/head-staff/mobile/${path}`)
   }

   useEffect(() => {
      setCurrentActive(current.split("/")[2])
   }, [current])

   const items: NavbarMenuItem[] = [
      {
         name: t("Dashboard"),
         key: "dashboard",
         icon: <DashboardFilled />,
         onClick: () => handleClick("dashboard"),
      },
      {
         name: t("requestsNav"),
         key: "requests",
         icon: <ContainerFilled />,
         onClick: () => handleClick("requests"),
      },
      {
         name: t("tasksNav"),
         key: "tasks",
         icon: <CheckOutlined />,
         onClick: () => handleClick("tasks"),
      },
      {
         name: t("Profile"),
         key: "profile",
         icon: <EllipsisOutlined />,
         onClick: () => handleClick("profile"),
      },
   ]

   return <MobileNavbar items={items} currentActive={currentActive} />
}
