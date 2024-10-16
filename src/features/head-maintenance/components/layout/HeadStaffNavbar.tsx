"use client"

import { Divider, Drawer } from "antd"
import {
   SettingOutlined,
   HistoryOutlined,
   QrcodeOutlined,
   MenuOutlined,
   HomeOutlined,
   ContainerFilled,
   CheckOutlined,
   HomeFilled,
   ContainerOutlined,
   LogoutOutlined,
} from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useLogout from "@/lib/domain/User/useLogout"

export default function SideNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const [isDrawerVisible, setIsDrawerVisible] = useState(false)
   const router = useRouter()
   const [handleLogout] = useLogout()

   function handleClick(path: string) {
      setCurrentActive(path)
      router.push(`/head-staff/mobile/${path}`)
      setIsDrawerVisible(false)
   }

   function toggleDrawer() {
      setIsDrawerVisible(!isDrawerVisible)
   }

   useEffect(() => {
      setCurrentActive(current.split("/")[2])

      return () => {
         setCurrentActive(undefined)
      }
   }, [current])

   const items = [
      {
         name: "Thống kê",
         key: "dashboard",
         icon: <HomeOutlined />,
         href: "/head-staff/mobile/dashboard",
         onClick: () => handleClick("dashboard"),
      },
      {
         name: "Yêu cầu",
         key: "requests",
         icon: <ContainerOutlined />,
         href: "/head-staff/mobile/request",
         onClick: () => handleClick("requests"),
      },
      {
         name: "Tác vụ",
         key: "tasks",
         icon: <CheckOutlined />,
         href: "/head-staff/mobile/tasks",
         onClick: () => handleClick("tasks"),
      },
      {
         name: "Hồ sơ",
         key: "profile",
         icon: <SettingOutlined />,
         href: "/head-staff/mobile/profile",
         onClick: () => handleClick("profile"),
      },
   ]

   return (
      <>
         <MenuOutlined
            onClick={toggleDrawer}
            style={{ position: "fixed", top: 25, zIndex: 1000, fontSize: "1.3rem", left: 10 }}
         />
         <Drawer
            placement="left"
            closable={false}
            onClose={toggleDrawer}
            open={isDrawerVisible}
            styles={{ header: { display: "none" } }}
            width="66vw"
         >
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
               <ul style={{ fontSize: "1.5rem", padding: 0, flexGrow: 1 }}>
                  {items.map((item, index) => (
                     <div key={item.key}>
                        <li
                           onClick={item.onClick}
                           style={{
                              padding: "20px 0",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              backgroundColor: "transparent",
                              transition: "background-color 0.2s",
                           }}
                           onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
                           onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                           onMouseDown={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
                           onMouseUp={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
                        >
                           <span style={{ fontSize: "1.3rem", marginRight: "10px" }}>{item.icon}</span>
                           <span style={{ fontSize: "1.3rem" }}>{item.name}</span>
                        </li>
                        {index < items.length - 1 && <Divider style={{ margin: "0" }} />}
                     </div>
                  ))}
               </ul>
               <Divider style={{ margin: "20px 0" }} />
               <li
                  onClick={handleLogout}
                  style={{
                     padding: "20px 0",
                     cursor: "pointer",
                     display: "flex",
                     alignItems: "center",
                     backgroundColor: "transparent",
                     transition: "background-color 0.2s",
                     color: "red",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  onMouseDown={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
                  onMouseUp={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
               >
                  <span style={{ fontSize: "1.3rem", marginRight: "10px" }}>
                     <LogoutOutlined />
                  </span>
                  <span style={{ fontSize: "1.3rem" }}>Logout</span>
               </li>
            </div>
         </Drawer>
      </>
   )
}
