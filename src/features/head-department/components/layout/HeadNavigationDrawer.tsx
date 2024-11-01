"use client"

import { BellOutlined, DashboardFilled, HistoryOutlined, HomeOutlined, PlusOutlined } from "@ant-design/icons"
import { usePathname, useRouter } from "next/navigation"
import NavigationDrawer, { NavigationDrawerProps } from "@/components/layout/NavigationDrawer"
import { createContext, PropsWithChildren, useContext, useRef } from "react"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import hd_uris from "@/features/head-department/uri"
import { Badge, Button } from "antd"
import hm_uris from "@/features/head-maintenance/uri"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import head_department_queries from "@/features/head-department/queries"

type ContextType = {
   handleOpen: () => void
}
const Context = createContext<ContextType | null>(null)

function HeadNavigationDrawer(props: PropsWithChildren) {
   const current = usePathname()
   const router = useRouter()
   const control_ref = useRef<RefType<NavigationDrawerProps>>(null)

   const api_notifications = head_department_queries.notifications.all({ seen: false })

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
               type="head_department"
               extraItems={[
                  <Badge key={"notifications"} count={api_notifications.data?.length ?? 0} size={"small"}>
                     <Button
                        icon={<BellOutlined className={"text-white"} />}
                        type={"text"}
                        onClick={() => {
                           control_ref.current?.handleClose()
                           setTimeout(() => {
                              router.push(hd_uris.navbar.notifications)
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
                     key: hd_uris.navbar.dashboard,
                  },
                  {
                     label: "Tạo yêu cầu",
                     icon: <PlusOutlined />,
                     type: "item",
                     key: hd_uris.navbar.scan,
                  },
                  {
                     label: "Lịch sử yêu cầu",
                     icon: <HistoryOutlined />,
                     type: "item",
                     key: hd_uris.navbar.history,
                  },
               ]}
            />
         </OverlayControllerWithRef>
      </>
   )
}

HeadNavigationDrawer.useDrawer = () => {
   const context = useContext(Context)
   if (context === null) {
      throw new Error("HeadNavigationDrawer.useDrawer must be used within HeadNavigationDrawer")
   }
   return context
}

export default HeadNavigationDrawer
