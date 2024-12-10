"use client"

import NavigationDrawer, { NavigationDrawerProps } from "@/components/layout/NavigationDrawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import global_queries from "@/features/common/queries"
import hm_uris from "@/features/head-maintenance/uri"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { AuditOutlined, BellOutlined, CheckSquareOutlined, HomeOutlined, InboxOutlined } from "@ant-design/icons"
import { Badge, Button } from "antd"
import dayjs from "dayjs"
import { usePathname, useRouter } from "next/navigation"
import { createContext, PropsWithChildren, useContext, useMemo, useRef } from "react"

type ContextType = {
   handleOpen: () => void
}
const Context = createContext<ContextType | null>(null)

function HeadMaintenanceNavigationDrawer(props: PropsWithChildren) {
   const current = usePathname()
   const router = useRouter()
   const control_ref = useRef<RefType<NavigationDrawerProps>>(null)

   function getUnreadNotificationCount(notifications: NotificationDto[]) {
      const today = dayjs().startOf("day")
      const yesterday = today.subtract(1, "day")

      let todayUnread = 0
      let yesterdayUnread = 0

      notifications.forEach((notification) => {
         const notificationDate = dayjs(notification.createdAt).startOf("day")
         if (!notification.seenDate) {
            if (notificationDate.isSame(today, "day")) {
               todayUnread++
            } else if (notificationDate.isSame(yesterday, "day")) {
               yesterdayUnread++
            }
         }
      })

      if (todayUnread > 0) return todayUnread
      if (yesterdayUnread > 0) return yesterdayUnread
      return 0
   }
   const api_notifications = global_queries.notifications.all({ hasSeen: false })

   const unreadCount = useMemo(() => {
      if (api_notifications.data) {
         return getUnreadNotificationCount(api_notifications.data)
      }
      return 0
   }, [api_notifications.data])

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
                  <Badge key={"notifications"} count={unreadCount > 0 ? unreadCount : undefined} size={"small"}>
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
                  {
                     label: "Danh sách thiết bị",
                     icon: <AuditOutlined />,
                     type: "item",
                     key: hm_uris.navbar.device,
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
