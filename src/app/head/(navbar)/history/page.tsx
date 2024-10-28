"use client"

import { FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { Alert, Badge, Button, Input, Select } from "antd"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import HistoryList from "./HistoryList.component"
import { CloseCircleFilled, FilterOutlined, InfoCircleFilled, MenuOutlined, SearchOutlined } from "@ant-design/icons"
import HeadNavigationDrawer from "@/features/head-department/components/layout/HeadNavigationDrawer"
import head_department_queries from "@/features/head-department/queries"
import hd_uris from "@/features/head-department/uri"
import ClickableArea from "@/components/ClickableArea"
import { cn } from "@/lib/utils/cn.util"
import dayjs from "dayjs"
import FilterDrawer, { FilterDrawerProps, FilterQuery } from "@/app/head/(navbar)/history/Filter.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { AreaDto } from "@/lib/domain/Area/Area.dto"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"

function Page({ searchParams }: { searchParams: { status?: FixRequestStatuses } }) {
   const navDrawer = HeadNavigationDrawer.useDrawer()
   const router = useRouter()

   const [tab, setTab] = useState<FixRequestStatuses | "all">(searchParams.status ?? "pending")
   const [search, setSearch] = useState<string>("")
   const [query, setQuery] = useState<FilterQuery>({})

   const containerRef = useRef<HTMLDivElement | null>(null)
   const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
   const control_filterDrawer = useRef<RefType<FilterDrawerProps>>(null)

   const api_requests = head_department_queries.request.all({})

   const no_toFeedback = useMemo(() => {
      if (!api_requests.isSuccess) return 0

      return api_requests.data.filter((i) => i.status === FixRequestStatus.HEAD_CONFIRM).length
   }, [api_requests.data, api_requests.isSuccess])

   const areas = useMemo(() => {
      if (!api_requests.isSuccess) return []

      let returnValue: { [key: string]: AreaDto } = {}
      api_requests.data.forEach((i) => {
         returnValue[i.device.area.id] = i.device.area
      })

      return Object.values(returnValue)
   }, [api_requests.data, api_requests.isSuccess])

   const machineModels = useMemo(() => {
      if (!api_requests.isSuccess) return []

      let returnValue: { [key: string]: MachineModelDto } = {}

      api_requests.data.forEach((i) => {
         returnValue[i.device.machineModel.id] = i.device.machineModel
      })

      return Object.values(returnValue)
   }, [api_requests.data, api_requests.isSuccess])

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

      list = list.filter((i) => {
         if (query.areaId && i.device.area.id !== query.areaId) return false
         if (query.requester_note && !i.requester_note.includes(query.requester_note)) return false
         if (query.machineModelId && i.device.machineModel.id !== query.machineModelId) return false
         if (query.createdAt_start && dayjs(i.createdAt).isBefore(dayjs(query.createdAt_start))) return false
         if (query.createdAt_end && dayjs(i.createdAt).isAfter(dayjs(query.createdAt_end))) return false
         return true
      })

      list = list.sort((a, b) => dayjs(a.updatedAt).diff(dayjs(b.updatedAt)))

      return list
   }, [api_requests.data, api_requests.isSuccess, tab, search, query])

   function handleChangeTab(tabKey: FixRequestStatuses | "all") {
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
      <>
         {no_toFeedback > 0 && (
            <Alert
               type="warning"
               banner
               message={<div className="text-sm">Có {no_toFeedback} yêu cầu đang Chờ đánh giá</div>}
               action={
                  <Button size="small" type="text" className="text-sm" onClick={() => setTab("head_confirm")}>
                     Xem
                  </Button>
               }
               icon={<InfoCircleFilled />}
               showIcon
            />
         )}
         <div className="std-layout relative h-full min-h-screen bg-white">
            <div className="std-layout-outer absolute left-0 top-0 h-24 w-full bg-head_department" />
            <PageHeaderV2
               prevButton={<PageHeaderV2.MenuButton onClick={navDrawer.handleOpen} />}
               title={"Lịch sử Yêu cầu"}
               nextButton={
                  <Badge dot={Object.values(query).length > 0}>
                     <Button
                        icon={<FilterOutlined className="text-white" />}
                        type="text"
                        onClick={() =>
                           control_filterDrawer.current?.handleOpen({
                              query,
                              status: tab,
                              areas,
                              machineModels,
                           })
                        }
                     />
                  </Badge>
               }
            />
            {/*<section className="relative z-50 h-10 w-full rounded-lg border-2 border-blue-700 bg-blue-50"></section>*/}
            <Input
               size="large"
               placeholder="Tìm kiếm"
               prefix={<SearchOutlined className="mr-1 text-neutral-500" />}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
            <Select
               className="mb-3 mt-4 w-full text-center"
               size="large"
               value={tab}
               loading={api_requests.isPending}
               onChange={handleChangeTab}
               options={[
                  { label: "Chưa xử lý", value: "pending" },
                  { label: "Đang thực hiện", value: "in_progress" },
                  { label: "Chờ xác nhận", value: "head_confirm" },
                  { label: "Đã đóng", value: "closed" },
                  { label: "Đã hủy", value: "rejected" },
               ]}
            />

            <HistoryList key={tab} requests={renderList} />

            <OverlayControllerWithRef ref={control_filterDrawer}>
               <FilterDrawer
                  onSubmit={(query, tab) => {
                     setQuery(query)
                     setTimeout(() => handleChangeTab(tab), 200)
                  }}
                  onReset={() => setQuery({})}
               />
            </OverlayControllerWithRef>
         </div>
      </>
   )
}

export default Page
