// "use client"

// import MobileBottomNavbar, { NavbarMenuItem } from "@/components/layout/MobileBottomNavbar"
// import { CheckOutlined, ContainerFilled, HomeFilled, SettingOutlined } from "@ant-design/icons"
// import { usePathname } from "next/navigation"
// import { useEffect, useState } from "react"

// export default function StaffNavbar() {
//    const current = usePathname()
//    const [currentActive, setCurrentActive] = useState("dashboard")

//    function handleClick(path: string) {
//       setCurrentActive(path)
//    }

//    useEffect(() => {
//       setCurrentActive(current.split("/")[2])
//    }, [current])

//    const items: NavbarMenuItem[] = [
//       {
//          name: "",
//          key: "dashboard",
//          icon: <HomeFilled />,
//          href: "/staff/dashboard",
//          onClick: () => handleClick("dashboard"),
//       },
//       {
//          name: "",
//          key: "tasks",
//          icon: <ContainerFilled />,
//          href: "/staff/tasks",
//          onClick: () => handleClick("tasks"),
//       },
//       {
//          name: "",
//          key: "map",
//          icon: <CheckOutlined />,
//          href: "/staff/map",
//          onClick: () => handleClick("map"),
//       },
//       {
//          name: "",
//          key: "profile",
//          icon: <SettingOutlined />,
//          href: "/staff/profile",
//          onClick: () => handleClick("profile"),
//       },
//    ]

//    return <MobileBottomNavbar items={items} currentActive={currentActive} />
// }
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
} from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SideNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const [isDrawerVisible, setIsDrawerVisible] = useState(false)
   const router = useRouter()

   function handleClick(path: string) {
      setCurrentActive(path)
      router.push(`/staff/${path}`)
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
         href: "/staff/dashboard",
         onClick: () => handleClick("dashboard"),
      },
      {
         name: "Tác vụ",
         key: "tasks",
         icon: <ContainerOutlined />,
         href: "/staff/tasks",
         onClick: () => handleClick("tasks"),
      },
      {
         name: "Bản đồ",
         key: "map",
         icon: <CheckOutlined />,
         href: "/staff/map",
         onClick: () => handleClick("map"),
      },
      {
         name: "Hồ sơ",
         key: "profile",
         icon: <SettingOutlined />,
         href: "/staff/profile",
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
                        <span style={{ fontSize: "1.3rem", marginRight: "10px" }}>{item.icon}</span>
                        <span style={{ fontSize: "1.3rem" }}>{item.name}</span>
                     </li>
                     {index < items.length - 1 && <Divider style={{ margin: "0" }} />}
                  </div>
               ))}
            </ul>
         </Drawer>
      </>
   )
}
