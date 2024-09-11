"use client"

import { ReactNode } from "react"
import { ProLayout } from "@ant-design/pro-layout"
import { usePathname, useRouter } from "next/navigation"
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
   CheckSquareOutlined,
   InboxOutlined,
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
                              label: "Đăng xuất",
                              danger: true,
                              onClick: () => {
                                 router.push("/login?logout=success")
                                 Cookies.remove("token")
                              },
                           },
                           {
                              key: "settings",
                              icon: <SettingOutlined />,
                              label: "Cài đặt",
                           },
                        ],
                     }}
                  >
                     {dom}
                  </Dropdown>
               )
            },
         }}
         title="Quản lý"
         layout="side"
         fixSiderbar={true}
         onMenuHeaderClick={() => router.push("/admin/dashboard")}
         route={{
            routes: [
               {
                  key: "general",
                  name: "Thông tin chung",
                  children: [
                     {
                        key: "dashboard",
                        path: "/admin/dashboard",
                        name: "Thống kê",
                        icon: <DashboardOutlined />,
                     },
                  ],
               },
               {
                  key: "data management",
                  name: "Trường dữ liệu",
                  children: [
                     {
                        key: "areas",
                        name: "Khu vực",
                        icon: <AreaChartOutlined />,
                        path: "/admin/area",
                     },
                     // {
                     //    key: "machine models",
                     //    name: "Machine Models",
                     //    icon: <RobotOutlined />,
                     //    path: "/admin/machine-models",
                     // },
                     {
                        key: "devices",
                        name: "Thiết bị",
                        icon: <LaptopOutlined />,
                        path: "/admin/devices",
                     },
                     {
                        key: "requests",
                        name: "Yêu cầu",
                        icon: <InboxOutlined />,
                        path: "/admin/requests",
                     },
                     {
                        key: "tasks",
                        name: "Tác vụ",
                        icon: <CheckSquareOutlined />,
                        path: "/admin/tasks",
                     },
                     {
                        key: "spare parts",
                        name: "Linh kiện",
                        icon: <ApiOutlined />,
                        path: "/admin/spare-parts",
                     },
                  ],
               },
               {
                  key: "site settings",
                  name: "Quản lý trang",
                  children: [
                     {
                        key: "users",
                        name: "Tài khoản",
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
