"use client"

import { BellOutlined, CheckSquareOutlined, HomeOutlined, InboxOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import NavigationDrawer, { NavigationDrawerProps } from "@/components/layout/NavigationDrawer"
import { createContext, PropsWithChildren, useContext, useRef } from "react"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import hm_uris from "@/features/head-maintenance/uri"
import { Badge, Button } from "antd"
import head_maintenance_queries from "@/features/head-maintenance/queries"

type ContextType = {
   handleOpen: () => void
}
const Context = createContext<ContextType | null>(null)

function HeadMaintenanceNavigationDrawer(props: PropsWithChildren) {
   const current = usePathname()
   const router = useRouter()
   const control_ref = useRef<RefType<NavigationDrawerProps>>(null)

   const api_notifications = head_maintenance_queries.notifications.all({ seen: false })

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
               type="head_maintenance"
               extraItems={[
                  <Badge key={"notifications"} count={api_notifications.data?.length ?? 0} size={"small"}>
                     <Button
                        icon={<BellOutlined className={"text-white"} />}
                        type={"text"}
                        onClick={() => {
                           control_ref.current?.handleClose()
                           setTimeout(() => {
                              router.push(hm_uris.navbar.notifications)
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
                     key: hm_uris.navbar.dashboard,
                  },
                  {
                     label: "Danh sách yêu cầu",
                     icon: <InboxOutlined />,
                     type: "item",
                     key: hm_uris.navbar.requests,
                  },
                  {
                     label: "Danh sách tác vụ",
                     icon: <CheckSquareOutlined />,
                     type: "item",
                     key: hm_uris.navbar.tasks,
                  },
               ]}
            />
         </OverlayControllerWithRef>
      </>
   )
}

HeadMaintenanceNavigationDrawer.useDrawer = () => {
   const context = useContext(Context)
   if (context === null) {
      throw new Error("HeadMaintenanceNavigaionDrawer.useDrawer must be used within HeadMaintenanceNavigaionDrawer")
   }
   return context
}

export default HeadMaintenanceNavigationDrawer
