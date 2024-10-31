"use client"

import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import HeadMaintenanceNavigationDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { Avatar, Card, Divider, Empty, List, Space, Spin } from "antd"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import { Gear, MapPin } from "@phosphor-icons/react"
import dayjs from "dayjs"
import { InboxOutlined } from "@ant-design/icons"
import { useMemo } from "react"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import useHeadMaintenance_notificationsRedirecter from "@/features/head-maintenance/useNotificationsRedirect"
import { cn } from "@/lib/utils/cn.util"
import { NotificationsIdentifierMapper } from "@/features/head-maintenance/notifications"

function Page() {
   const navDrawer = HeadMaintenanceNavigationDrawer.useDrawer()

   const redirecter = useHeadMaintenance_notificationsRedirecter()

   const api_notifications = head_maintenance_queries.notifications.all({})

   const renderList = useMemo(() => {
      const returnValue: {
         today: NotificationDto[]
         yesterday: NotificationDto[]
         older: NotificationDto[]
      } = {
         today: [],
         yesterday: [],
         older: [],
      }

      if (!api_notifications.isSuccess) return returnValue
      api_notifications.data.forEach((item) => {
         if (dayjs(item.createdAt).isSame(dayjs(), "day")) {
            returnValue.today.push(item)
         } else if (dayjs(item.createdAt).isSame(dayjs().subtract(1, "day"), "day")) {
            returnValue.yesterday.push(item)
         } else {
            returnValue.older.push(item)
         }
      })

      return returnValue
   }, [api_notifications.data, api_notifications.isSuccess])

   return (
      <div className={"relative"}>
         <div className={"absolute left-0 top-0 h-[72px] w-full bg-head_maintenance"} />
         <PageHeaderV2
            prevButton={<PageHeaderV2.MenuButton onClick={navDrawer.handleOpen} />}
            title={"Thông báo"}
            nextButton={<PageHeaderV2.InfoButton />}
         />

         {Object.values(renderList).every((value) => value.length === 0) && (
            <section className={"p-layout"}>
               <Card>
                  <Empty description={"Bạn không có thông báo"} />
               </Card>
            </section>
         )}
         {api_notifications.isPending && (
            <div className={"grid place-items-center"}>
               <Spin />
            </div>
         )}
         {Object.entries(renderList).map(([key, value]) => (
            <section className={"mt-layout"} key={key}>
               {value.length > 0 && (
                  <>
                     <Divider className={"m-0 text-base"} orientation={"left"}>
                        {key === "today" && "Hôm nay"}
                        {key === "yesterday" && "Hôm qua"}
                        {key === "older" && "Cũ hơn"}
                     </Divider>
                     <List
                        dataSource={value}
                        loading={api_notifications.isPending}
                        className={"head_department_history_list"}
                        renderItem={(item) => (
                           <List.Item
                              className={cn("px-layout", !item.seen && "bg-green-100")}
                              onClick={() => redirecter(item)}
                           >
                              <List.Item.Meta
                                 avatar={<Avatar icon={<InboxOutlined />} size="small" />}
                                 title={
                                    <div className={"line-clamp-2 text-sm"}>
                                       {NotificationsIdentifierMapper(item.identifier)?.title(item.fromUser.username)}
                                    </div>
                                 }
                                 description={
                                    <Space
                                       className={"text-xs"}
                                       split={<Divider type={"vertical"} className={"m-0"} />}
                                       wrap
                                    >
                                       {!item.seen && <div className={"font-bold text-green-500"}>Mới</div>}
                                       <div className={"flex items-center gap-1"}>
                                          <MapPin size={16} weight={"duotone"} />
                                          <span>{item.content.areaName}</span>
                                       </div>
                                       <div className={"flex items-center gap-1"}>
                                          <Gear size={16} weight={"duotone"} />
                                          <span className={"truncate"}>{item.content.deviceName}</span>
                                       </div>
                                    </Space>
                                 }
                              />
                              {/*<div className={"flex justify-between text-sm"}>{dayjs(item.createdAt).format("DD/MM/YYYY")}</div>*/}
                           </List.Item>
                        )}
                     />
                  </>
               )}
            </section>
         ))}
      </div>
   )
}

export default Page
