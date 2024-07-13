"use client"

import { ReactNode } from "react"
import {
   ApiOutlined,
   AreaChartOutlined,
   DashboardOutlined,
   GithubFilled,
   InfoCircleFilled,
   LaptopOutlined,
   LogoutOutlined,
   QuestionCircleFilled,
   RobotOutlined,
   SettingOutlined,
   UserOutlined,
} from "@ant-design/icons"
import { Dropdown } from "antd"
import Cookies from "js-cookie"
import Link from "next/link"
import { ProLayout } from "@ant-design/pro-layout"
import { usePathname, useRouter } from "next/navigation"
import LocaleSwitcher from "@/common/components/LocaleSwitcher"

export default function HeadStaffDesktopLayout({ children }: { children: ReactNode }) {
   const router = useRouter()
   const pathname = usePathname()
   return (
      <ProLayout
         location={{
            pathname,
         }}
         bgLayoutImgList={[
            {
               src: "https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png",
               left: 85,
               bottom: 100,
               height: "303px",
            },
            {
               src: "https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png",
               bottom: -68,
               right: -45,
               height: "303px",
            },
            {
               src: "https://img.alicdn.com/imgextra/i3/O1CN018NxReL1shX85Yz6Cx_!!6000000005798-2-tps-884-496.png",
               bottom: 0,
               left: 0,
               width: "331px",
            },
         ]}
         siderMenuType="group"
         menu={{
            collapsedShowGroupTitle: true,
         }}
         actionsRender={(props) => {
            if (props.isMobile) return []
            return [<LocaleSwitcher key="locale" />]
         }}
         avatarProps={{
            src: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
            title: "Admin",
            className: "cursor-pointer",
            render: (_, dom) => {
               return (
                  <Dropdown
                     className="w-full cursor-pointer"
                     menu={{
                        items: [
                           {
                              key: "logout",
                              icon: <LogoutOutlined />,
                              label: "Logout",
                              danger: true,
                              onClick: () => {
                                 router.push("/login?logout=success")
                                 Cookies.remove("token")
                              },
                           },
                           {
                              key: "settings",
                              icon: <SettingOutlined />,
                              label: "Settings",
                           },
                           {
                              key: "Profile",
                              icon: <UserOutlined />,
                              label: "Profile",
                           },
                        ],
                     }}
                  >
                     {dom}
                  </Dropdown>
               )
            },
         }}
         title="Admin Panel"
         layout="side"
         fixSiderbar={true}
         onMenuHeaderClick={() => router.push("/admin/dashboard")}
         route={{
            routes: [
               {
                  key: "general",
                  name: "General",
                  children: [
                     {
                        key: "dashboard",
                        path: "/admin/dashboard",
                        name: "Dashboard",
                        icon: <DashboardOutlined />,
                     },
                  ],
               },
               {
                  key: "data management",
                  name: "Data Management",
                  children: [
                     {
                        key: "areas",
                        name: "Areas",
                        icon: <AreaChartOutlined />,
                        path: "/admin/area",
                     },
                     {
                        key: "machine models",
                        name: "Machine Models",
                        icon: <RobotOutlined />,
                        path: "/admin/machine-models",
                     },
                     {
                        key: "devices",
                        name: "Devices",
                        icon: <LaptopOutlined />,
                        path: "/admin/devices",
                     },
                     {
                        key: "spare parts",
                        name: "Spare Parts",
                        icon: <ApiOutlined />,
                        path: "/admin/spare-parts",
                     },
                  ],
               },
               {
                  key: "site settings",
                  name: "Site Settings",
                  children: [
                     {
                        key: "users",
                        name: "Users",
                        path: "/admin/users",
                        icon: <UserOutlined />,
                     },
                  ],
               },
            ],
         }}
         onError={() => {
            console.log("Hi error")
         }}
         menuItemRender={(item, dom) => <Link href={item.path ?? "/head-staff/desktop"}>{dom}</Link>}
      >
         {children}
      </ProLayout>
   )
}