"use client"

import { useEffect, useState } from "react"
import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavbar"
import { EllipsisOutlined, HistoryOutlined, HomeFilled, SearchOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"

export default function HeadNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const router = useRouter()
   const { t } = useTranslation()

   function handleClick(path: string) {
      setCurrentActive(path)
      router.push(`/head/${path}`)
   }

   useEffect(() => {
      setCurrentActive(current.split("/")[2])
   }, [current])

   const items: NavbarMenuItem[] = [
      {
         name: t("Dashboard"),
         key: "dashboard",
         icon: <HomeFilled />,
         onClick: () => handleClick("dashboard"),
      },
      {
         name: t("Scan"),
         key: "scan",
         icon: <SearchOutlined />,
         onClick: () => handleClick("scan"),
      },
      {
         name: t("MyRequests"),
         key: "history",
         icon: <HistoryOutlined />,
         onClick: () => handleClick("history"),
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
