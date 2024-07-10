"use client"

import { useEffect, useState } from "react"
import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavbar"
import { CheckOutlined, ContainerFilled, DashboardFilled, EllipsisOutlined, UserOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useRouter as useNextRouter } from "next/router"
import { TeamFill } from "antd-mobile-icons"
import vie from "@/common/locales/vie"
import eng from "@/common/locales/eng"
import { useTranslation } from "react-i18next"

export default function StockkeeperNavbar() {
   const { t } = useTranslation()
   const pathname = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const router = useRouter()

   useEffect(() => {
      setCurrentActive(pathname.split("/")[2])
   }, [pathname])

   useEffect(() => {
      if (currentActive) router.push(`/stockkeeper/${currentActive}`)
   }, [currentActive, router])

   const items: NavbarMenuItem[] = [
      {
         name: t("Dashboard"),
         key: "dashboard",
         icon: <DashboardFilled />,
         onClick: () => setCurrentActive("dashboard"),
      },
      {
         name: t("machineModelNav"),
         key: "machine-model",
         icon: <ContainerFilled />,
         onClick: () => setCurrentActive("machine-model"),
      },
      {
         name: t("tasksNav"),
         key: "tasks",
         icon: <CheckOutlined />,
         onClick: () => setCurrentActive("tasks"),
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
