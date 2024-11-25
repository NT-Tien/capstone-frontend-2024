"use client"

import { Dropdown } from "antd"
import {
   ApiOutlined,
   AreaChartOutlined,
   CheckSquareOutlined,
   DashboardOutlined,
   InboxOutlined,
   LaptopOutlined,
   LogoutOutlined,
   SettingOutlined,
   UserOutlined,
} from "@ant-design/icons"
import Cookies from "js-cookie"
import Link from "next/link"
import { ProLayout } from "@ant-design/pro-layout"
import { PropsWithChildren } from "react"
import { usePathname, useRouter } from "next/navigation"

function RightNavbar({ children }: PropsWithChildren) {
   const pathname = usePathname()
   const router = useRouter()

   return (
      <ProLayout
         isChildrenLayout={false}
         contentWidth="Fixed"
         contentStyle={{
            width: "auto",
         }}
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
                        key: "requests",
                        name: "Yêu cầu",
                        icon: <InboxOutlined />,
                        path: "/admin/request",
                     },
                     {
                        key: "tasks",
                        name: "Tác vụ",
                        icon: <CheckSquareOutlined />,
                        path: "/admin/task",
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
                        path: "/admin/user",
                        icon: <UserOutlined />,
                     },
                     {
                        key: "areas",
                        name: "Khu vực",
                        icon: <AreaChartOutlined />,
                        path: "/admin/area",
                     },
                     {
                        key: "devices",
                        name: "Mẫu máy",
                        icon: <LaptopOutlined />,
                        path: "/admin/machine-model",
                     },
                     {
                        key: "request-ticket",
                        name: "Vé yêu cầu",
                        icon: <InboxOutlined />,
                        path: "/admin/request-ticket",
                     },
                     // {
                     //    key: "spare parts",
                     //    name: "Linh kiện",
                     //    icon: <ApiOutlined />,
                     //    path: "/admin/spare-part",
                     // },
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

export default RightNavbar
