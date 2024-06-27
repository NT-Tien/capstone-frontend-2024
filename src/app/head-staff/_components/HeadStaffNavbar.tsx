"use client"

import { useEffect, useState } from "react"
import MobileNavbar, { NavbarMenuItem } from "@/common/components/MobileNavbar"
import { CheckOutlined, ContainerFilled, DashboardFilled, UserOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useRouter as useNextRouter } from 'next/router';
import { TeamFill } from "antd-mobile-icons"
import vie from "@/common/locales/vie"
import eng from "@/common/locales/eng"
import { useTranslation } from "react-i18next"

export default function HeadStaffNavbar() {
   const { t } = useTranslation();
   const pathname = usePathname();
   const [currentActive, setCurrentActive] = useState<string | undefined>();
   const router = useRouter();
 
   useEffect(() => {
     setCurrentActive(pathname.split("/")[2]);
   }, [pathname]);
 
   useEffect(() => {
     if (currentActive) router.push(`/head-staff/${currentActive}`);
   }, [currentActive, router]);

   const items: NavbarMenuItem[] = [
      {
         name: t('Dashboard'),
         key: "dashboard",
         icon: <DashboardFilled />,
         onClick: () => setCurrentActive("dashboard"),
      },
      {
         name: t('requestsNav'),
         key: "requests",
         icon: <ContainerFilled />,
         onClick: () => setCurrentActive("requests"),
      },
      {
         name: t('tasksNav'),
         key: "tasks",
         icon: <CheckOutlined />,
         onClick: () => setCurrentActive("tasks"),
      },
      {
         name: t('Profile'),
         key: "profile",
         icon: <UserOutlined />,
         onClick: () => setCurrentActive("profile"),
      },
   ]

   return <MobileNavbar items={items} currentActive={currentActive} />
}
