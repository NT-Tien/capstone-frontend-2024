"use client"

import {
   ApiOutlined,
   BellOutlined,
   DashboardOutlined,
   OrderedListOutlined,
   ImportOutlined,
   LogoutOutlined,
   QrcodeOutlined,
   SendOutlined,
   FileTextOutlined,
} from "@ant-design/icons"
import { ProLayout } from "@ant-design/pro-layout"
import { Dropdown } from "antd"
import Cookies from "js-cookie"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ReactNode } from "react"

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
         avatarProps={{
            src: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
            title: "Stockkeeper",
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
         onMenuHeaderClick={() => router.push("/stockkeeper/desktop/dashboard")}
         route={{
            routes: [
               {
                  key: "general",
                  name: "Thông tin chung",
                  children: [
                     {
                        key: "dashboard",
                        path: "/stockkeeper/desktop/dashboard",
                        name: "Thống kê",
                        icon: <DashboardOutlined />,
                     },
                     {
                        key: "notification",
                        path: "/stockkeeper/desktop/notifications",
                        name: "Thông báo",
                        icon: <BellOutlined />,
                     },
                  ],
               },
               {
                  key: "forms",
                  name: "Thủ tục",
                  children: [
                     {
                        key: "import",
                        name: "Đơn nhập kho",
                        icon: <ImportOutlined />,
                        path: "/stockkeeper/desktop/spare-parts/import",
                     },
                     {
                        key: "export",
                        name: "Đơn xuất kho",
                        icon: <FileTextOutlined />,
                        path: "/stockkeeper/desktop/spare-parts/export",
                     },
                  ],
               },
               {
                  key: "spare-part",
                  name: "Linh kiện",
                  children: [
                     {
                        key: "spareparts-list",
                        name: "Danh sách",
                        icon: <OrderedListOutlined />,
                        path: "/stockkeeper/desktop/spare-parts",
                     },
                     {
                        key: "need-more",
                        name: "Linh kiện thiếu",
                        icon: <ApiOutlined />,
                        path: "/stockkeeper/desktop/spare-parts/missing",
                     },
                  ],
               },
               {
                  key: "tasks",
                  name: "Tác vụ",
                  children: [
                     {
                        key: "task list",
                        name: "Danh sách",
                        icon: <OrderedListOutlined />,
                        path: "/stockkeeper/desktop/tasks",
                     },
                     {
                        key: "scan",
                        name: "Giao linh kiện",
                        icon: <SendOutlined />,
                        path: "/stockkeeper/desktop/tasks/scan",
                     },
                     {
                        key: "return",
                        name: "Trả linh kiện",
                        icon: <ImportOutlined />,
                        path: "/stockkeeper/desktop/tasks/return",
                     },
                  ],
               },
            ],
         }}
         onError={() => {
            console.log("Hi error")
         }}
         menuItemRender={(item, dom) => <Link href={item.path ?? "/stockkeeper/desktop/dashboard"}>{dom}</Link>}
      >
         {children}
      </ProLayout>
   )
}
