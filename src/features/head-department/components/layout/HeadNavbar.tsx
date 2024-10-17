"use client"

import { DashboardFilled, HistoryOutlined, MenuOutlined, PlusOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import useLogout from "@/lib/domain/User/useLogout"
import NavigationDrawer, { NavigationDrawerProps } from "@/components/layout/NavigationDrawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"

export default function SideNavbar() {
   const current = usePathname()
   const [currentActive, setCurrentActive] = useState<string | undefined>()
   const [isDrawerVisible, setIsDrawerVisible] = useState(false)
   const router = useRouter()
   const [handleLogout] = useLogout()

   const control_navigationDrawer = useRef<RefType<NavigationDrawerProps>>(null)

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

   return (
      <>
         <MenuOutlined
            onClick={() => control_navigationDrawer.current?.handleOpen({})}
            style={{ position: "fixed", top: 25, zIndex: 1000, fontSize: "1.3rem", left: 10 }}
         />
         <OverlayControllerWithRef ref={control_navigationDrawer}>
            <NavigationDrawer
               activeKey={current}
               onItemClick={(item) => {
                  router.push(item.key)
               }}
               type="head_department"
               items={[
                  {
                     label: "Thống kê",
                     icon: <DashboardFilled />,
                     type: "item",
                     key: "/head/dashboard",
                  },
                  {
                     label: "Tạo yêu cầu",
                     icon: <PlusOutlined />,
                     type: "item",
                     key: "/head/scan",
                  },
                  {
                     label: "Lịch sử yêu cầu",
                     icon: <HistoryOutlined />,
                     type: "item",
                     key: "/head/history",
                  },
               ]}
            />
         </OverlayControllerWithRef>
         {/*<Drawer*/}
         {/*   placement="left"*/}
         {/*   closable={false}*/}
         {/*   onClose={toggleDrawer}*/}
         {/*   open={isDrawerVisible}*/}
         {/*   styles={{ header: { display: "none" } }}*/}
         {/*   width="66vw"*/}
         {/*>*/}
         {/*   <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>*/}
         {/*      <ul style={{ fontSize: "1.5rem", padding: 0, flexGrow: 1 }}>*/}
         {/*         {items.map((item, index) => (*/}
         {/*            <div key={item.key}>*/}
         {/*               <li*/}
         {/*                  onClick={item.onClick}*/}
         {/*                  style={{*/}
         {/*                     padding: "20px 0",*/}
         {/*                     cursor: "pointer",*/}
         {/*                     display: "flex",*/}
         {/*                     alignItems: "center",*/}
         {/*                     backgroundColor: "transparent",*/}
         {/*                     transition: "background-color 0.2s",*/}
         {/*                  }}*/}
         {/*                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}*/}
         {/*                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}*/}
         {/*                  onMouseDown={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}*/}
         {/*                  onMouseUp={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}*/}
         {/*               >*/}
         {/*                  <span style={{ fontSize: "1.3rem", marginRight: "10px" }}>{item.icon}</span>*/}
         {/*                  <span style={{ fontSize: "1.3rem" }}>{item.name}</span>*/}
         {/*               </li>*/}
         {/*               {index < items.length - 1 && <Divider style={{ margin: "0" }} />}*/}
         {/*            </div>*/}
         {/*         ))}*/}
         {/*      </ul>*/}
         {/*      <Divider style={{ margin: "20px 0" }} />*/}
         {/*      <li*/}
         {/*         onClick={handleLogout}*/}
         {/*         style={{*/}
         {/*            padding: "20px 0",*/}
         {/*            cursor: "pointer",*/}
         {/*            display: "flex",*/}
         {/*            alignItems: "center",*/}
         {/*            backgroundColor: "transparent",*/}
         {/*            transition: "background-color 0.2s",*/}
         {/*            color: "red",*/}
         {/*         }}*/}
         {/*         onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}*/}
         {/*         onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}*/}
         {/*         onMouseDown={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}*/}
         {/*         onMouseUp={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}*/}
         {/*      >*/}
         {/*         <span style={{ fontSize: "1.3rem", marginRight: "10px" }}>*/}
         {/*            <LogoutOutlined />*/}
         {/*         </span>*/}
         {/*         <span style={{ fontSize: "1.3rem" }}>Logout</span>*/}
         {/*      </li>*/}
         {/*   </div>*/}
         {/*</Drawer>*/}
      </>
   )
}
