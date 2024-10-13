"use client"

import React, { PropsWithChildren, useState } from "react"
import { Menu, Layout as AntLayout } from "antd"
import Sider from "antd/es/layout/Sider"
import { usePathname, useRouter } from "next/navigation"

function Layout(props: PropsWithChildren) {
   const router = useRouter()
   const pathname = usePathname()

   const [collapsed, setCollapsed] = useState(false)

   return (
      <AntLayout style={{ minHeight: "100vh" }}>
         <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <div className="demo-logo-vertical" />
            <Menu
               theme="dark"
               defaultSelectedKeys={pathname === "/simulation/main-flow" ? ["/simulation/main-flow"] : []}
               mode="inline"
               items={[
                  {
                     label: "Giả lập luồng chính",
                     key: "/simulation/main-flow",
                  },
                  {
                     label: "Dev: OLD",
                     key: "/simulation/old-flow",
                  },
               ]}
               onClick={(e) => {
                  router.push(e.key)
               }}
            />
         </Sider>
         <AntLayout>{props.children}</AntLayout>
      </AntLayout>
   )
}

export default Layout
