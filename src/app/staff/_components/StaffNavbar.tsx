"use client"

import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavbar"
import { CheckOutlined, ContainerFilled, DashboardFilled, EllipsisOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"

export default function StaffNavbar() {
   const current = usePathname()
   const router = useRouter()
   const { t } = useTranslation()

   function handleNavigate(location: string) {
      router.push(`/staff/${location}`)
   }

   const items: NavbarMenuItem[] = [
      {
         name: "Dashboard",
         key: "dashboard",
         icon: <DashboardFilled />,
         onClick: () => handleNavigate("dashboard"),
      },
      {
         name: "Task List",
         key: "tasks",
         icon: <ContainerFilled />,
         onClick: () => handleNavigate("tasks"),
      },
      {
         name: "Device Map",
         key: "map",
         icon: <CheckOutlined />,
         onClick: () => handleNavigate("map"),
      },
      {
         name: t("Profile"),
         key: "profile",
         icon: <EllipsisOutlined />,
         onClick: () => handleNavigate("profile"),
      },
   ]

   return <MobileNavbar items={items} currentActive={current.split("/")[2]} />
}
