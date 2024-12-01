"use client"

import ClickableArea from "@/components/ClickableArea"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import PageError from "@/components/PageError"
import global_mutations from "@/features/common/mutations"
import global_queries from "@/features/common/queries"
import HM_Notifications_ClickHandler from "@/features/head-maintenance/notifications-handler"
import { NotificationDto } from "@/lib/domain/Notification/Notification.dto"
import { cn } from "@/lib/utils/cn.util"
import { App, Dropdown, Empty, List, Segmented, Spin } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

function Page() {
   const [tab, setTab] = useState<"unread" | "all">("unread")
   const { modal } = App.useApp()
   const router = useRouter()

   const api_notifications = global_queries.notifications.all({
      hasSeen: tab === "unread" ? false : undefined,
   })

   const mutate_seen = global_mutations.notifications.seen({ showMessages: false })
   const mutate_seen_all = global_mutations.notifications.seenAll()

   const renderList = useMemo(() => {
      // sort notifications into date groups
      const returnValue: {
         [date: string]: NotificationDto[]
      } = {}

      api_notifications.data?.forEach((notification) => {
         const date = new Date(notification.createdAt).toDateString()
         if (!returnValue[date]) {
            returnValue[date] = []
         }
         returnValue[date].push(notification)
      })

      return returnValue
   }, [api_notifications.data])

   if (api_notifications.isError) {
      return <PageError />
   }

   return (
      <div className="pb-layout">
         <PageHeaderV2
            title="Thông báo"
            prevButton={<PageHeaderV2.BackButton onClick={router.back} />}
            nextButton={
               <Dropdown
                  menu={{
                     items: [
                        {
                           key: "1",
                           label: "Đánh dấu tất cả đã đọc",
                           onClick: () =>
                              modal.confirm({
                                 title: "Xác nhận",
                                 content: "Đánh dấu tất cả thông báo đã đọc?",
                                 onOk: () =>
                                    mutate_seen_all.mutate({}, { onSettled: () => api_notifications.refetch() }),
                              }),
                        },
                     ],
                  }}
               >
                  <PageHeaderV2.InfoButton />
               </Dropdown>
            }
            type="dark"
         />
         <div className="px-layout">
            <Segmented
               block
               className="bg-head_maintenance"
               value={tab}
               onChange={(tab) => setTab(tab as any)}
               size="large"
               options={[
                  {
                     label: <div className={cn(tab !== "unread" && "text-white/50", "text-base")}>Chưa đọc</div>,
                     value: "unread",
                  },
                  {
                     label: <div className={cn(tab !== "all" && "text-white/50", "text-base")}>Tất cả</div>,
                     value: "all",
                  },
               ]}
            />
         </div>
         <div className="mt-layout px-layout">
            {api_notifications.isPending && (
               <div className="grid place-items-center py-24">
                  <Spin />
               </div>
            )}
            {api_notifications.data?.length === 0 && (
               <div className="grid place-items-center py-24">
                  <Empty description="Không tìm thấy thông báo nào" />
               </div>
            )}
            {Object.keys(renderList).map((date) => (
               <section key={`date_${date}`} className="mb-3">
                  <header className="flex">
                     <h2 className="mr-auto font-semibold capitalize">{dateRenderer(date)}</h2>
                     <p>{renderList[date].length}</p>
                  </header>
                  <main className="mt-2 flex flex-col gap-2">
                     <List
                        dataSource={renderList[date]}
                        split={false}
                        renderItem={(n, i) => (
                           <ClickableArea
                              reset
                              block
                              onClick={() => {
                                 mutate_seen.mutate({ id: n.id }, { onSettled: () => api_notifications.refetch() })

                                 HM_Notifications_ClickHandler(n, router)
                              }}
                           >
                              <List.Item
                                 className={cn(
                                    "w-full border-2 border-b-0 border-red-200 bg-red-100 p-2.5",
                                    n.seenDate && "bg-white",
                                    i === 0 && "rounded-t-lg",
                                    i === renderList[date].length - 1 && "rounded-b-lg border-b-2",
                                 )}
                              >
                                 <List.Item.Meta
                                    title={<h3 className="text-medium truncate text-sm">{n.title}</h3>}
                                    description={<p className="truncate text-sm text-neutral-500">{n.body}</p>}
                                 />
                              </List.Item>
                           </ClickableArea>
                        )}
                     />
                  </main>
               </section>
            ))}
         </div>
      </div>
   )
}

function dateRenderer(dateStr: string) {
   const date = dayjs(dateStr).locale("vi").tz("Asia/Ho_Chi_Minh")
   const now = dayjs()

   if (date.diff(now, "day") === 0) {
      return "Hôm nay"
   } else if (date.diff(now, "day") === -1) {
      return "Hôm qua"
   } else {
      return date.format("DD/MM/YYYY")
   }
}

export default Page
