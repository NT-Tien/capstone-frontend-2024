"use client"

import { useEffect, useState } from "react"
import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavbar"
import { EllipsisOutlined, HistoryOutlined, HomeFilled, SearchOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"

export default function HeadNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const { t } = useTranslation()

   function handleClick(path: string) {
      setCurrentActive(path)
   }

   useEffect(() => {
      setCurrentActive(current.split("/")[2])
   }, [current])

   const items: NavbarMenuItem[] = [
      {
         name: t("Dashboard"),
         key: "dashboard",
         icon: <HomeFilled />,
         href: "/head/dashboard",
         onClick: () => handleClick("dashboard"),
      },
      {
         name: t("Scan"),
         key: "scan",
         icon: <SearchOutlined />,
         href: "/head/scan",
         onClick: () => handleClick("scan"),
      },
      {
         name: t("MyRequests"),
         key: "history",
         icon: <HistoryOutlined />,
         href: "/head/history",
         onClick: () => handleClick("history"),
      },
      {
         name: t("Profile"),
         key: "profile",
         icon: <EllipsisOutlined />,
         href: "/head/profile",
         onClick: () => handleClick("profile"),
      },
   ]

   return <MobileNavbar items={items} currentActive={currentActive} />
}
