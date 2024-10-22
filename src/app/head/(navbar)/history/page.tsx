"use client"

import { FixRequest_StatusData, FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { Button, Card, Input, Spin } from "antd"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import HistoryList from "./HistoryList.component"
import { CloseCircleFilled, FilterOutlined, MenuOutlined, SearchOutlined } from "@ant-design/icons"
import HeadNavigationDrawer from "@/features/head-department/components/layout/HeadNavigationDrawer"
import head_department_queries from "@/features/head-department/queries"
import hd_uris from "@/features/head-department/uri"
import ClickableArea from "@/components/ClickableArea"
import { cn } from "@/lib/utils/cn.util"
import dayjs from "dayjs"

function Page({ searchParams }: { searchParams: { status?: FixRequestStatuses } }) {
   const navDrawer = HeadNavigationDrawer.useDrawer()
   const router = useRouter()

   const [tab, setTab] = useState<FixRequestStatuses | "all">(searchParams.status ?? "pending")
   const [search, setSearch] = useState<string>("")
   const [search_value, setSearch_value] = useState<string>("")

   const containerRef = useRef<HTMLDivElement | null>(null)
   const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

   const api_requests = head_department_queries.request.all({})

   const renderList = useMemo(() => {
      if (!api_requests.isSuccess) return []

      let list = [...api_requests.data]

      list = list.filter((i) => {
         return (
            i.requester_note.toLowerCase().includes(search.toLowerCase()) ||
            i.device.machineModel.name.toLowerCase().includes(search.toLowerCase()) ||
            i.device.area.name.toLowerCase().includes(search.toLowerCase())
         )
      })

      switch (tab) {
         case "pending": {
            list = list.filter((i) => i.status === FixRequestStatus.PENDING)
            break
         }
         case "approved":
         case "in_progress": {
            list = list.filter(
               (i) => i.status === FixRequestStatus.IN_PROGRESS || i.status === FixRequestStatus.APPROVED,
            )
            break
         }
         case "head_confirm": {
            list = list.filter((i) => i.status === FixRequestStatus.HEAD_CONFIRM)
            break
         }
         case "closed": {
            list = list.filter((i) => i.status === FixRequestStatus.CLOSED)
            break
         }
         case "head_cancel":
         case "rejected": {
            list = list.filter(
               (i) => i.status === FixRequestStatus.HEAD_CANCEL || i.status === FixRequestStatus.REJECTED,
            )
            break
         }
      }

      list = list.sort((a, b) => dayjs(a.updatedAt).diff(dayjs(b.updatedAt)))

      return list
   }, [api_requests.data, api_requests.isSuccess, tab, search])

   function handleChangeTab(tabKey: FixRequestStatuses) {
      const newTab = tabKey === tab ? "all" : tabKey
      setTab(newTab)
      router.push(hd_uris.navbar.history + `?status=${newTab}`)
   }

   useEffect(() => {
      function scrollToItem(index: number) {
         const currentItemRef = itemRefs.current[index]
         if (containerRef.current && currentItemRef) {
            const containerWidth = containerRef.current.offsetWidth
            const itemOffsetLeft = currentItemRef.offsetLeft
            const itemWidth = currentItemRef.offsetWidth

            const scrollPosition = itemOffsetLeft - containerWidth / 2 + itemWidth / 2
            containerRef.current.scrollTo({
               left: scrollPosition,
               behavior: "smooth",
            })
         }
      }

      switch (tab) {
         case "pending":
         case "all":
            scrollToItem(0)
            break
         case "approved":
         case "in_progress":
            scrollToItem(1)
            break
         case "head_confirm":
            scrollToItem(2)
            break
         case "closed":
            scrollToItem(3)
            break
         case "rejected":
         case "head_cancel":
            scrollToItem(4)
            break
      }
   }, [tab])

   return (
      <div className="std-layout relative h-full min-h-screen bg-white">
         <div className="std-layout-outer absolute left-0 top-0 h-24 w-full bg-head_department" />
         <header className="std-layout-outer relative z-50 flex items-center justify-between p-layout">
            <Button icon={<MenuOutlined className="text-white" />} type="text" onClick={navDrawer.handleOpen} />
            <h1 className="text-lg font-bold text-white">Lịch sử Yêu cầu</h1>
            <Button icon={<FilterOutlined className="text-white" />} type="text" />
         </header>
         <Input
            size="large"
            placeholder="Tìm kiếm"
            prefix={<SearchOutlined className="mr-1 text-neutral-500" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
         />
         <div className="std-layout-outer mb-4 mt-2 flex gap-2 overflow-x-auto px-layout" ref={containerRef}>
            <ClickableArea
               className={cn(
                  "border-2 border-neutral-500 px-3 py-1 text-sm text-neutral-500",
                  tab === "pending" && "bg-neutral-500 text-white",
               )}
               onClick={() => handleChangeTab("pending")}
               ref={(el) => {
                  itemRefs.current[0] = el
               }}
            >
               Chưa xử lý
               {tab === "pending" && <CloseCircleFilled />}
            </ClickableArea>
            <ClickableArea
               className={cn(
                  "border-2 border-blue-500 px-3 py-1 text-sm text-blue-500",
                  (tab === "in_progress" || tab === "approved") && "bg-blue-500 text-white",
               )}
               onClick={() => handleChangeTab("in_progress")}
               ref={(el) => {
                  itemRefs.current[1] = el
               }}
            >
               Đang thực hiện
               {(tab === "in_progress" || tab === "approved") && <CloseCircleFilled />}
            </ClickableArea>
            <ClickableArea
               className={cn(
                  "border-2 border-yellow-500 px-3 py-1 text-sm text-yellow-800",
                  tab === "head_confirm" && "bg-yellow-500 text-white",
               )}
               onClick={() => handleChangeTab("head_confirm")}
               ref={(el) => {
                  itemRefs.current[2] = el
               }}
            >
               Chờ xác nhận
               {tab === "head_confirm" && <CloseCircleFilled />}
            </ClickableArea>
            <ClickableArea
               className={cn(
                  "border-2 border-purple-500 px-3 py-1 text-sm text-purple-500",
                  tab === "closed" && "bg-purple-500 text-white",
               )}
               onClick={() => handleChangeTab("closed")}
               ref={(el) => {
                  itemRefs.current[3] = el
               }}
            >
               Đã đóng
               {tab === "closed" && <CloseCircleFilled />}
            </ClickableArea>
            <ClickableArea
               className={cn(
                  "border-2 border-red-500 px-3 py-1 text-sm text-red-500",
                  (tab === "rejected" || tab === "head_cancel") && "bg-red-500 text-white",
               )}
               onClick={() => handleChangeTab("rejected")}
               ref={(el) => {
                  itemRefs.current[4] = el
               }}
            >
               Đã hủy
               {(tab === "rejected" || tab === "head_cancel") && <CloseCircleFilled />}
            </ClickableArea>
         </div>

         <HistoryList key={tab} requests={renderList} />
      </div>
   )
}

export default Page
