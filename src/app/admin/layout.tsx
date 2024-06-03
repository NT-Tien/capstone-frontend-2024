"use client"

import { ReactNode } from "react"
import { ProLayout } from "@ant-design/pro-layout"
import { usePathname, useRouter } from "next/navigation"
import {
   ApiOutlined,
   AreaChartOutlined,
   DashboardOutlined,
   GithubFilled,
   HeatMapOutlined,
   InfoCircleFilled,
   LaptopOutlined,
   LogoutOutlined,
   PlusOutlined,
   QuestionCircleFilled,
   RobotOutlined,
   SettingOutlined,
   UnorderedListOutlined,
   UserOutlined,
} from "@ant-design/icons"
import Link from "next/link"
import { Dropdown } from "antd"
import Cookies from "js-cookie"

export default function AdminLayout({ children }: { children: ReactNode }) {
   const pathname = usePathname()
   const router = useRouter()
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
            return [
               <InfoCircleFilled key="InfoCircleFilled" />,
               <QuestionCircleFilled key="QuestionCircleFilled" />,
               <GithubFilled key="GithubFilled" />,
            ]
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
                        key: "positions",
                        name: "Positions",
                        icon: <HeatMapOutlined />,
                        path: "/admin/positions",
                     },
                     {
                        key: "machine models",
                        name: "Machine Models",
                        icon: <RobotOutlined />,
                        children: [
                           {
                              key: "machine model list",
                              path: "/admin/machine-models/list",
                              name: "List",
                              icon: <UnorderedListOutlined />,
                           },
                           {
                              key: "create machine model",
                              path: "/admin/machine-models/new",
                              name: "Create",
                              icon: <PlusOutlined />,
                           },
                        ],
                     },
                     {
                        key: "devices",
                        name: "Devices",
                        icon: <LaptopOutlined />,
                        children: [
                           {
                              key: "device list",
                              path: "/admin/devices/list",
                              name: "List",
                              icon: <UnorderedListOutlined />,
                           },
                           {
                              key: "create device",
                              path: "/admin/devices/new",
                              name: "Create",
                              icon: <PlusOutlined />,
                           },
                        ],
                     },
                     {
                        key: "spare parts",
                        name: "Spare Parts",
                        icon: <ApiOutlined />,
                        children: [
                           {
                              key: "spare part list",
                              path: "/admin/spare-parts/list",
                              name: "List",
                              icon: <UnorderedListOutlined />,
                           },
                           {
                              key: "create spare part",
                              path: "/admin/spare-parts/new",
                              name: "Create",
                              icon: <PlusOutlined />,
                           },
                        ],
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
         menuItemRender={(item, dom) => <Link href={item.path ?? "/admin"}>{dom}</Link>}
      >
         {children}
      </ProLayout>
   )
}
