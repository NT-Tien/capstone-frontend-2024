"use client"

import {
   BellOutlined,
   CheckSquareOutlined,
   DashboardFilled,
   HistoryOutlined,
   HomeOutlined,
   InboxOutlined,
   PlusOutlined,
} from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import NavigationDrawer, { NavigationDrawerProps } from "@/components/layout/NavigationDrawer"
import { createContext, PropsWithChildren, useContext, useRef } from "react"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import staff_uri from "@/features/staff/uri"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import staff_queries from "@/features/staff/queries"
import { Badge, Button } from "antd"
import hm_uris from "@/features/head-maintenance/uri"

type ContextType = {
   handleOpen: () => void
}
const Context = createContext<ContextType | null>(null)

function StaffNavigationDrawer(props: PropsWithChildren) {
   const current = usePathname()
   const router = useRouter()
   const control_ref = useRef<RefType<NavigationDrawerProps>>(null)

   const api_notifications = staff_queries.notifications.all({ hasSeen: false })

   function handleOpen() {
      control_ref.current?.handleOpen({})
   }

   return (
      <>
         <Context.Provider value={{ handleOpen }}>{props.children}</Context.Provider>
         <OverlayControllerWithRef ref={control_ref}>
            <NavigationDrawer
               activeKey={current}
               onItemClick={(item) => {
                  router.push(item.key)
               }}
               type="staff"
               extraItems={[
                  <Badge key={"notifications"} count={api_notifications.data?.length ?? 0} size={"small"}>
                     <Button
                        icon={<BellOutlined className={"text-white"} />}
                        type={"text"}
                        onClick={() => {
                           control_ref.current?.handleClose()
                           setTimeout(() => {
                              router.push(staff_uri.navbar.notifications)
                           }, 200)
                        }}
                     />
                  </Badge>,
               ]}
               items={[
                  {
                     label: "Trang chủ",
                     icon: <HomeOutlined />,
                     type: "item",
                     key: staff_uri.navbar.dashboard,
                  },
                  {
                     label: "Tác vụ cần làm",
                     icon: <CheckSquareOutlined />,
                     type: "item",
                     key: staff_uri.navbar.tasks,
                  },
               ]}
            />
         </OverlayControllerWithRef>
      </>
   )
}

StaffNavigationDrawer.useDrawer = () => {
   const context = useContext(Context)
   if (context === null) {
      throw new Error("StaffNavigationDrawer.useDrawer must be used within StaffNavigationDrawer")
   }
   return context
}

export default StaffNavigationDrawer
