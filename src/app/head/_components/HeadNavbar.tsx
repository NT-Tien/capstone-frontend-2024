"use client"

import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavbar"
import { SettingOutlined, HistoryOutlined, HomeFilled, QrcodeOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function HeadNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const router = useRouter()

   function handleClick(path: string) {
      setCurrentActive(path)
      router.push(`/head/${path}`)
   }

   useEffect(() => {
      setCurrentActive(current.split("/")[2])

      return () => {
         setCurrentActive(undefined)
      }
   }, [current])

   const items: NavbarMenuItem[] = [
      {
         name: "",
         key: "dashboard",
         icon: <HomeFilled />,
         href: "/head/dashboard",
         onClick: () => handleClick("dashboard"),
      },
      {
         name: "",
         key: "scan",
         icon: <QrcodeOutlined />,
         href: "/head/scan",
         onClick: () => handleClick("scan"),
      },
      {
         name: "",
         key: "history",
         icon: <HistoryOutlined />,
         href: "/head/history",
         onClick: () => handleClick("history"),
      },
      {
         name: "",
         key: "profile",
         icon: <SettingOutlined />,
         href: "/head/profile",
         onClick: () => handleClick("profile"),
      },
   ]

   return <MobileNavbar items={items} currentActive={currentActive} />
}
