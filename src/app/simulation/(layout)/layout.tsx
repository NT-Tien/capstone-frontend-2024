"use client"

import React, { PropsWithChildren, useState } from "react"
import { Menu, Layout as AntLayout } from "antd"
import Sider from "antd/es/layout/Sider"
import { useRouter } from "next/navigation"

function Layout(props: PropsWithChildren) {
   const router = useRouter()

   const [collapsed, setCollapsed] = useState(false)

   return (
      <AntLayout style={{ minHeight: "100vh" }}>
         <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <div className="demo-logo-vertical" />
            <Menu
               theme="dark"
               defaultSelectedKeys={["1"]}
               mode="inline"
               items={[
                  {
                     label: "Giả lập luồng chính",
                     key: "/simulation/main-flow",
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
