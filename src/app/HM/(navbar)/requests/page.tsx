"use client"

import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { Badge, Button, Card, Input } from "antd"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircleFilled, FilterOutlined, SearchOutlined } from "@ant-design/icons"
import { cn } from "@/lib/utils/cn.util"
import HeadMaintenanceNavigaionDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import hm_uris from "@/features/head-maintenance/uri"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import ClickableArea from "@/components/ClickableArea"
import RequestList from "@/app/HM/(navbar)/requests/RequestList.component"
import FilterDrawer, { FilterDrawerProps, FilterQuery } from "@/app/HM/(navbar)/requests/Filter.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { AreaDto } from "@/lib/domain/Area/Area.dto"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { UserDto } from "@/lib/domain/User/User.dto"

function Page({ searchParams }: { searchParams: { status?: FixRequestStatus } }) {
   const navDrawer = HeadMaintenanceNavigaionDrawer.useDrawer()
   const router = useRouter()

   const [query, setQuery] = useState<FilterQuery>({})
   const [tab, setTab] = useState<FixRequestStatus>(searchParams?.status ?? FixRequestStatus.PENDING)
   const [search, setSearch] = useState<string>("")

   const containerRef = useRef<HTMLDivElement | null>(null)
   const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
   const control_filterDrawer = useRef<RefType<FilterDrawerProps>>(null)

   const api_requests = head_maintenance_queries.request.all({
      page: 1,
      limit: 5000,
      status: tab,
   })

   const uniqueValues = useMemo(() => {
      if (!api_requests.isSuccess) return

      const areas: { [key: string]: AreaDto } = {}
      const machineModels: { [key: string]: MachineModelDto } = {}
      const users: { [key: string]: UserDto } = {}

      api_requests.data.list.forEach((i) => {
         areas[i.device.area.id] = i.device.area
         machineModels[i.device.machineModel.id] = i.device.machineModel
         users[i.requester.id] = i.requester
      })

      return {
         areas: Object.values(areas),
         machineModels: Object.values(machineModels),
         users: Object.values(users),
      }
   }, [api_requests.data?.list, api_requests.isSuccess])

   const renderList = useMemo(() => {
      if (!api_requests.isSuccess) return []

      let list = api_requests.data.list

      list = list.filter((i) => {
         return (
            i.requester_note.toLowerCase().includes(search.toLowerCase()) ||
            i.device.machineModel.name.toLowerCase().includes(search.toLowerCase()) ||
            i.device.area.name.toLowerCase().includes(search.toLowerCase())
         )
      })

      list = list.filter((i) => {
         if (query.areaId && i.device.area.id !== query.areaId) return false
         if (query.machineModelId && i.device.machineModel.id !== query.machineModelId) return false
         if (query.requester_note && !i.requester_note.toLowerCase().includes(query.requester_note.toLowerCase()))
            return false
         if (query.requesterId && i.requester.id !== query.requesterId) return false
         if (query.createdAt_start && new Date(i.createdAt) < new Date(query.createdAt_start)) return false
         if (query.createdAt_end && new Date(i.createdAt) > new Date(query.createdAt_end)) return false
         if (query.no_issues_min !== undefined && i.issues && i.issues.length <= query.no_issues_min) return false
         if (query.no_issues_max !== undefined && i.issues && i.issues.length >= query.no_issues_max) return false
         if (query.no_tasks_min !== undefined && i.tasks && i.tasks.length <= query.no_tasks_min) return false
         if (query.no_tasks_max !== undefined && i.tasks && i.tasks.length >= query.no_tasks_max) return false
         if (query.hasReviewed !== undefined)
            if (query.hasReviewed ? i.status === FixRequestStatus.HEAD_CONFIRM : i.status === FixRequestStatus.CLOSED)
               return false
         if (query.hasSeen !== undefined && query.hasSeen !== i.is_seen) return false

         return true
      })

      if (tab === FixRequestStatus.PENDING) {
         // order list by created at (asc) if pending
         list = list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      } else {
         // order list by updated at (desc) if not pending
         list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }

      return list
   }, [api_requests.isSuccess, api_requests.data?.list, tab, search, query])

   function handleChangeTab(tab: FixRequestStatus) {
      setTab(tab)

      const tabURL = new URLSearchParams()
      tabURL.set("status", tab)
      router.push(hm_uris.navbar.requests + `?status=${tab}`)
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
         case FixRequestStatus.PENDING:
            scrollToItem(0)
            break
         case FixRequestStatus.APPROVED:
            scrollToItem(1)
            break
         case FixRequestStatus.IN_PROGRESS:
            scrollToItem(2)
            break
         case FixRequestStatus.CLOSED:
            scrollToItem(3)
            break
         case FixRequestStatus.REJECTED:
            scrollToItem(4)
            break
      }
   }, [tab])

   return (
      <>
         <div className="std-layout relative h-full min-h-screen bg-white">
            <div className="std-layout-outer absolute left-0 top-0 h-24 w-full bg-head_maintenance" />
            <PageHeaderV2
               prevButton={<PageHeaderV2.MenuButton onClick={navDrawer.handleOpen} />}
               title={"Danh sách Yêu cầu"}
               nextButton={
                  <Badge dot={Object.values(query).length > 0}>
                     <Button
                        icon={<FilterOutlined className="text-white" />}
                        type="text"
                        onClick={() =>
                           control_filterDrawer.current?.handleOpen({
                              query,
                              status: tab,
                              areas: uniqueValues?.areas,
                              machineModels: uniqueValues?.machineModels,
                              requesters: uniqueValues?.users,
                           })
                        }
                     />
                  </Badge>
               }
            />
            <Input
               size="large"
               placeholder="Tìm kiếm"
               prefix={<SearchOutlined className="mr-1 text-neutral-500" />}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
            <div
               className="std-layout-outer hide-scrollbar mb-4 mt-3 flex gap-2 overflow-x-auto px-layout"
               ref={containerRef}
            >
               <ClickableArea
                  className={cn(
                     "border-2 border-neutral-300 px-3 py-1 text-sm text-neutral-500",
                     tab === FixRequestStatus.PENDING && "bg-neutral-500 text-white",
                  )}
                  onClick={() => handleChangeTab(FixRequestStatus.PENDING)}
                  ref={(el) => {
                     itemRefs.current[0] = el
                  }}
               >
                  Chưa xử lý
                  {tab === FixRequestStatus.PENDING && <CheckCircleFilled />}
               </ClickableArea>{" "}
               <ClickableArea
                  className={cn(
                     "border-2 border-green-300 px-3 py-1 text-sm text-green-500",
                     tab === FixRequestStatus.APPROVED && "bg-green-500 text-white",
                  )}
                  onClick={() => handleChangeTab(FixRequestStatus.APPROVED)}
                  ref={(el) => {
                     itemRefs.current[1] = el
                  }}
               >
                  Đã xác nhận lỗi
                  {tab === FixRequestStatus.APPROVED && <CheckCircleFilled />}
               </ClickableArea>
               <ClickableArea
                  className={cn(
                     "border-2 border-blue-300 px-3 py-1 text-sm text-blue-500",
                     tab === FixRequestStatus.IN_PROGRESS && "bg-blue-500 text-white",
                  )}
                  onClick={() => handleChangeTab(FixRequestStatus.IN_PROGRESS)}
                  ref={(el) => {
                     itemRefs.current[2] = el
                  }}
               >
                  Đang thực hiện
                  {tab === FixRequestStatus.IN_PROGRESS && <CheckCircleFilled />}
               </ClickableArea>
               <ClickableArea
                  className={cn(
                     "border-2 border-purple-300 px-3 py-1 text-sm text-purple-500",
                     tab === FixRequestStatus.CLOSED && "bg-purple-500 text-white",
                  )}
                  onClick={() => handleChangeTab(FixRequestStatus.CLOSED)}
                  ref={(el) => {
                     itemRefs.current[3] = el
                  }}
               >
                  Đã hoàn thành
                  {tab === FixRequestStatus.CLOSED && <CheckCircleFilled />}
               </ClickableArea>
               <ClickableArea
                  className={cn(
                     "border-2 border-red-300 px-3 py-1 text-sm text-red-500",
                     tab === FixRequestStatus.REJECTED && "bg-red-500 text-white",
                  )}
                  onClick={() => handleChangeTab(FixRequestStatus.REJECTED)}
                  ref={(el) => {
                     itemRefs.current[4] = el
                  }}
               >
                  Từ chối sửa
                  {tab === FixRequestStatus.REJECTED && <CheckCircleFilled />}
               </ClickableArea>
            </div>

            {api_requests.isPending && <Card loading />}

            {api_requests.isSuccess && <RequestList key={tab} requests={renderList} />}

            <OverlayControllerWithRef ref={control_filterDrawer}>
               <FilterDrawer
                  onReset={() => setQuery({})}
                  onSubmit={(query, status) => {
                     setQuery(query)
                     setTimeout(() => handleChangeTab(status), 200)
                  }}
               />
            </OverlayControllerWithRef>
         </div>
      </>
   )
}

export default Page
