"use client"

import FilterDrawer, { FilterDrawerProps, FilterQuery } from "@/app/head/(navbar)/history/Filter.drawer"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import HeadNavigationDrawer from "@/features/head-department/components/layout/HeadNavigationDrawer"
import head_department_queries from "@/features/head-department/queries"
import hd_uris from "@/features/head-department/uri"
import { AreaDto } from "@/lib/domain/Area/Area.dto"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import { FilterOutlined, InfoCircleFilled, SearchOutlined } from "@ant-design/icons"
import { Alert, Badge, Button, Divider, Input, Select, Space } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import HistoryList from "./HistoryList.component"

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
         if (i.device.area) returnValue[i.device.area.id] = i.device.area
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
            i.device.area?.name.toLowerCase().includes(search.toLowerCase()) ||
            i.code.toLowerCase().includes(search.toLowerCase())
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
            list = list.filter(
               (i) => i.status === FixRequestStatus.HEAD_CONFIRM || i.status === FixRequestStatus.HM_VERIFY,
            )
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

      list = list.sort((a, b) => dayjs(b.updatedAt).diff(dayjs(a.updatedAt)))

      return list
   }, [api_requests.data, api_requests.isSuccess, tab, search, query])

   function handleChangeTab(tabKey: FixRequestStatuses | "all") {
      const newTab = tabKey === tab ? "all" : tabKey
      setTab(newTab)
      router.push(hd_uris.navbar.history + `?status=${newTab}`)
   }

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
            <PageHeaderV2
               prevButton={<PageHeaderV2.MenuButton onClick={navDrawer.handleOpen} />}
               title={"Lịch sử Yêu cầu"}
               className="sticky left-0 top-0 z-50 bg-head_department"
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
            <Space.Compact className={"mt-layout"}>
               <Input
                  placeholder="Tìm kiếm"
                  prefix={<SearchOutlined className="mr-1 text-neutral-500" />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
               <Select
                  className="w-full rounded-r-lg bg-head_department text-left *:text-white"
                  variant={"borderless"}
                  value={tab}
                  loading={api_requests.isPending}
                  onChange={handleChangeTab}
                  options={[
                     { label: "Chưa xử lý", value: "pending" },
                     { label: "Đang thực hiện", value: "in_progress" },
                     { label: "Đã hoàn thành", value: "head_confirm" },
                     { label: "Đã đóng", value: "closed" },
                     { label: "Đã hủy", value: "rejected" },
                     { label: "Tất cả ", value: "all" },
                  ]}
               />
            </Space.Compact>

            {renderList.length > 0 && (
               <section className={"mb-2 mt-2"}>
                  <Divider className="my-2" />
                  <div>Đang hiện {renderList.length} kết quả</div>
               </section>
            )}
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
