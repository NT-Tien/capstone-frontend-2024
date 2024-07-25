"use client"

import { DashboardOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons"
import { ProLayout } from "@ant-design/pro-layout"
import { CheckSquare, Tray } from "@phosphor-icons/react"
import { Dropdown } from "antd"
import Cookies from "js-cookie"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ReactNode } from "react"

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
                           {
                              key: "Profile",
                              icon: <UserOutlined />,
                              label: "Hồ sơ",
                           },
                        ],
                     }}
                  >
                     {dom}
                  </Dropdown>
               )
            },
         }}
         title="Head Staff"
         layout="side"
         fixSiderbar={true}
         onMenuHeaderClick={() => router.push("/head-staff/desktop/dashboard")}
         route={{
            routes: [
               {
                  key: "dashboard",
                  path: "/head-staff/desktop/dashboard",
                  name: "Trang chủ",
                  icon: <DashboardOutlined />,
               },
               {
                  key: "requests",
                  path: "/head-staff/desktop/requests",
                  name: "Yêu cầu",
                  icon: <Tray size={16} />,
               },
               {
                  key: "tasks",
                  path: "/head-staff/desktop/tasks",
                  name: "Tác vụ",
                  icon: <CheckSquare size={16} />,
               },
            ],
         }}
         onError={() => {
            console.log("Hi error")
         }}
         menuItemRender={(item, dom) => <Link href={item.path ?? "/head-staff/desktop"}>{dom}</Link>}
      >
         <div className="h-full min-h-screen w-full bg-neutral-100">{children}</div>
      </ProLayout>
   )
}
