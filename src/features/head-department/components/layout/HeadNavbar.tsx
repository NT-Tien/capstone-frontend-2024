"use client"

import { Divider, Drawer } from "antd"
import { SettingOutlined, HistoryOutlined, QrcodeOutlined, MenuOutlined, HomeOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SideNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const [isDrawerVisible, setIsDrawerVisible] = useState(false)
   const router = useRouter()

   function handleClick(path: string) {
      setCurrentActive(path)
      router.push(`/head/${path}`)
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
         href: "/head/dashboard",
         onClick: () => handleClick("dashboard"),
      },
      {
         name: "Tạo yêu cầu",
         key: "scan",
         icon: <QrcodeOutlined />,
         href: "/head/scan",
         onClick: () => handleClick("scan"),
      },
      {
         name: "Lịch sử",
         key: "history",
         icon: <HistoryOutlined />,
         href: "/head/history",
         onClick: () => handleClick("history"),
      },
      {
         name: "Hồ sơ",
         key: "profile",
         icon: <SettingOutlined />,
         href: "/head/profile",
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
            <ul style={{ fontSize: "1.5rem", padding: 0 }}>
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
                        <span style={{ fontSize: "0.5rem", marginRight: "10px" }}>{item.icon}</span>
                        {item.name}
                     </li>
                     {index < items.length - 1 && <Divider style={{ margin: "0" }} />}
                  </div>
               ))}
            </ul>
         </Drawer>
      </>
   )
}
