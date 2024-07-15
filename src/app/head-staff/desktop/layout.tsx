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
import { CheckSquare, Tray, User } from "@phosphor-icons/react"
import CreateTaskContextProvider, { CreateTaskContext } from "@/app/head-staff/_context/CreateTask.context"

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
         title="Head Staff"
         layout="side"
         fixSiderbar={true}
         onMenuHeaderClick={() => router.push("/head-staff/desktop/dashboard")}
         route={{
            routes: [
               {
                  key: "dashboard",
                  path: "/head-staff/desktop/dashboard",
                  name: "Dashboard",
                  icon: <DashboardOutlined />,
               },
               {
                  key: "requests",
                  path: "/head-staff/desktop/requests",
                  name: "Requests",
                  icon: <Tray size={16} />,
               },
               {
                  key: "tasks",
                  path: "/head-staff/desktop/tasks",
                  name: "Tasks",
                  icon: <CheckSquare size={16} />,
               },
               {
                  key: "staff",
                  path: "/head-staff/desktop/staff",
                  name: "Staff",
                  icon: <User size={16} />,
               },
            ],
         }}
         onError={() => {
            console.log("Hi error")
         }}
         menuItemRender={(item, dom) => <Link href={item.path ?? "/head-staff/desktop"}>{dom}</Link>}
      >
         <CreateTaskContextProvider>
            <div className="h-full min-h-screen w-full bg-neutral-100">{children}</div>
         </CreateTaskContextProvider>
      </ProLayout>
   )
}
