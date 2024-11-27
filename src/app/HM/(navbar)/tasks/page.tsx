"use client"

import HeadStaff_Task_All from "@/features/head-maintenance/api/task/all.api"
import TaskCard from "@/old/TaskCard"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import qk from "@/old/querykeys"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Badge, Button, Card, Divider, Empty, Input, List, Result, Select, Skeleton, Space } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import PageHeader from "@/components/layout/PageHeader"
import { FilterOutlined, SearchOutlined } from "@ant-design/icons"
import HeadMaintenanceNavigationDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"
import hm_uris from "@/features/head-maintenance/uri"
import { AreaDto } from "@/lib/domain/Area/Area.dto"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { UserDto } from "@/lib/domain/User/User.dto"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import FilterDrawer, { FilterDrawerProps, FilterQuery } from "./Filter.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"

function Page({ searchParams }: { searchParams: { page?: string; status?: TaskStatus } }) {
   const [status, setStatus] = useState<TaskStatus>(searchParams?.status ?? TaskStatus.AWAITING_FIXER)
   const page = Number(searchParams?.page ?? 1)
   const limit = 5
   const navDrawer = HeadMaintenanceNavigationDrawer.useDrawer()
   const [search, setSearch] = useState<string>("")
   const [query, setQuery] = useState<FilterQuery>({
      status: TaskStatus.AWAITING_FIXER,
   })
   const control_filterDrawer = useRef<RefType<FilterDrawerProps>>(null)
   const router = useRouter()

   const result = useInfiniteQuery({
      queryKey: qk.task.all(page, limit, status),
      queryFn: (req) => HeadStaff_Task_All({ page: req.pageParam, limit, status }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
         return lastPageParam + 1
      },
   })

   const api_tasks = head_maintenance_queries.task.all({
      page: 1,
      limit: 5000,
      status: status,
   })

   const uniqueValues = useMemo(() => {
      if (!api_tasks.isSuccess) return

      const areas: { [key: string]: AreaDto } = {}
      const machineModels: { [key: string]: MachineModelDto } = {}
      const users: { [key: string]: UserDto } = {}

      api_tasks.data.list.forEach((i) => {
         if (i.device.area) {
            areas[i.device.area.id] = i.device.area
         }
         machineModels[i.device.machineModel.id] = i.device.machineModel
         users[i.fixer?.id] = i.fixer
      })

      return {
         areas: Object.values(areas),
         machineModels: Object.values(machineModels),
         users: Object.values(users),
      }
   }, [api_tasks.data?.list, api_tasks.isSuccess])

   const renderList = useMemo(() => {
      if (!api_tasks.isSuccess) return []

      let list = api_tasks.data.list

      // if (status === TaskStatus.COMPLETED) {
      //    list = list.concat(api_head_confirm_requests.data?.list ?? [])
      // }

      list = list.filter((i) => {
         return (
            i.fixerNote?.toLowerCase().includes(search.toLowerCase()) ||
            i.device.machineModel.name.toLowerCase().includes(search.toLowerCase()) ||
            i.device?.area?.name.toLowerCase().includes(search.toLowerCase())
         )
      })

      list = list.filter((i) => {
         if (query.areaId && i.device?.area?.id !== query.areaId) return false
         if (query.machineModelId && i.device.machineModel.id !== query.machineModelId) return false
         if (query.fixerNote && !i.fixerNote.toLowerCase().includes(query.fixerNote.toLowerCase())) return false
         if (query.fixerId && i.fixer.id !== query.fixerId) return false
         if (query.createdAt_start && new Date(i.createdAt) < new Date(query.createdAt_start)) return false
         if (query.createdAt_end && new Date(i.createdAt) > new Date(query.createdAt_end)) return false
         if (query.no_issues_min !== undefined && i.issues && i.issues.length <= query.no_issues_min) return false
         if (query.no_issues_max !== undefined && i.issues && i.issues.length >= query.no_issues_max) return false
         // if (query.no_tasks_min !== undefined && i && i.length <= query.no_tasks_min) return false
         // if (query.no_tasks_max !== undefined && i.tasks && i.tasks.length >= query.no_tasks_max) return false
         if (query.hasReviewed !== undefined)
            if (query.hasReviewed ? i.status === TaskStatus.HEAD_STAFF_CONFIRM : i.status === TaskStatus.COMPLETED)
               return false
         // if (query.hasSeen !== undefined && query.hasSeen === i.is_seen) return false

         return true
      })

      if (status === TaskStatus.AWAITING_FIXER) {
         // order list by created at (asc) if pending
         list = list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      } else {
         // order list by updated at (desc) if not pending
         list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }

      return list
   }, [api_tasks.isSuccess, api_tasks.data?.list, status, search, query])

   function handleChangeTab(tab: TaskStatus) {
      setStatus(tab)

      const tabURL = new URLSearchParams()
      tabURL.set("status", tab)
      router.push(hm_uris.navbar.tasks + `?status=${tab}`)
   }

   useEffect(() => {
      let current = searchParams.status
      if (!current) current = TaskStatus.AWAITING_FIXER
      setStatus(current)
   }, [searchParams.status])

   const taskStatusOptions = [
      {
         value: TaskStatus.AWAITING_SPARE_SPART,
         label: (
            <>
               {/* {TaskStatusTagMapper[TaskStatus.AWAITING_SPARE_SPART].icon} */}
               {TaskStatusTagMapper[TaskStatus.AWAITING_SPARE_SPART].text}
            </>
         ),
      },
      {
         value: TaskStatus.AWAITING_FIXER,
         label: (
            <>
               {/* {TaskStatusTagMapper[TaskStatus.AWAITING_FIXER].icon} */}
               {TaskStatusTagMapper[TaskStatus.AWAITING_FIXER].text}
            </>
         ),
      },
      {
         value: TaskStatus.ASSIGNED,
         label: (
            <>
               {/* {TaskStatusTagMapper[TaskStatus.ASSIGNED].icon} */}
               {TaskStatusTagMapper[TaskStatus.ASSIGNED].text}
            </>
         ),
      },
      {
         value: TaskStatus.IN_PROGRESS,
         label: (
            <>
               {/* {TaskStatusTagMapper[TaskStatus.IN_PROGRESS].icon} */}
               {TaskStatusTagMapper[TaskStatus.IN_PROGRESS].text}
            </>
         ),
      },
      {
         value: TaskStatus.HEAD_STAFF_CONFIRM,
         label: (
            <>
               {/* {TaskStatusTagMapper[TaskStatus.HEAD_STAFF_CONFIRM].icon} */}
               {TaskStatusTagMapper[TaskStatus.HEAD_STAFF_CONFIRM].text}
            </>
         ),
      },
      {
         value: TaskStatus.COMPLETED,
         label: (
            <>
               {/* {TaskStatusTagMapper[TaskStatus.COMPLETED].icon} */}
               {TaskStatusTagMapper[TaskStatus.COMPLETED].text}
            </>
         ),
      },
      {
         value: TaskStatus.CANCELLED,
         label: (
            <>
               {/* {TaskStatusTagMapper[TaskStatus.CANCELLED].icon} */}
               {TaskStatusTagMapper[TaskStatus.CANCELLED].text}
            </>
         ),
      },
   ]

   return (
      <div className="std-layout relative h-full min-h-screen bg-white">
         <div className="std-layout-outer bg-head_maintenance">
            <PageHeaderV2
               prevButton={<PageHeaderV2.MenuButton onClick={navDrawer.handleOpen} />}
               title={"Danh sách Tác vụ"}
               nextButton={
                  <Badge dot={Object.values(query).length > 0}>
                     <Button
                        icon={<FilterOutlined className="text-white" />}
                        type="text"
                        onClick={() =>
                           control_filterDrawer.current?.handleOpen({
                              query,
                              status: status,
                              areas: uniqueValues?.areas,
                              machineModels: uniqueValues?.machineModels,
                              fixer: uniqueValues?.users,
                           })
                        }
                     />
                  </Badge>
               }
            />
         </div>
         <Space.Compact className={"mt-layout"}>
            <Input
               placeholder="Tìm kiếm"
               prefix={<SearchOutlined className="mr-1 text-neutral-500" />}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
            <Select
               className="w-full rounded-r-lg bg-head_maintenance text-left *:text-white"
               variant={"borderless"}
               value={status}
               loading={api_tasks.isPending}
               onChange={handleChangeTab}
               options={[
                  { label: "Chưa phân công", value: "AWAITING_FIXER" },
                  { label: "Chờ linh kiện", value: "AWAITING_SPARE_SPART" },
                  { label: "Chưa bắt đầu", value: "ASSIGNED" },
                  { label: "Chờ kiểm tra", value: "HEAD_STAFF_CONFIRM" },
                  { label: "Đã đóng", value: "COMPLETED" },
                  { label: "Đã hủy", value: "CANCELED" },
               ]}
            />
         </Space.Compact>
         <div className="mt-3">
            <div className="mb-3">Đang hiện {renderList.length} kết quả</div>
            {result.isError ? (
               <Result
                  status="error"
                  title="Có lỗi xảy ra"
                  subTitle="Vui lòng thử lại sau"
                  extra={<Button onClick={() => result.refetch()}>Thử lại</Button>}
               />
            ) : (
               <ListView
                  total={result.data?.pages[0].total ?? 0}
                  loadMore={result.fetchNextPage}
                  loading={result.isLoading}
                  items={result.data?.pages.flatMap((res) => res.list) ?? []}
               />
            )}
         </div>
         <h2 className="mb-2 px-layout text-lg font-semibold">
            <Skeleton paragraph={false} active={result.isPending} loading={result.isPending} />
         </h2>
         <OverlayControllerWithRef ref={control_filterDrawer}>
            <FilterDrawer
               onReset={() =>
                  setQuery({
                     status: TaskStatus.AWAITING_FIXER,
                  })
               }
               onSubmit={(query, status) => {
                  setQuery(query)
                  setTimeout(() => handleChangeTab(status), 200)
               }}
            />
         </OverlayControllerWithRef>
      </div>
   )
}

type ListViewType = {
   items: TaskDto[]
   loading: boolean
   loadMore: () => void
   total: number
}

function ListView(props: ListViewType) {
   const router = useRouter()

   if (props.items.length === 0) {
      return (
         <Card loading={props.loading}>
            <Empty description="Không có tác vụ nào" />
         </Card>
      )
   }

   return (
      <List
         loading={props.loading}
         loadMore={
            props.items.length !== 0 &&
            (props.total === props.items.length ? (
               <Divider className="text-sm">Bạn đang ở cuối danh sách</Divider>
            ) : (
               <Button onClick={props.loadMore}>Tải thêm</Button>
            ))
         }
         dataSource={props.items}
         itemLayout={"horizontal"}
         size={"small"}
         renderItem={(item, index) => {
            // Alternating classes for background color
            const isEven = index % 2 === 0
            const backgroundClass = isEven ? "bg-neutral-200" : "bg-white"

            return (
               <TaskCard
                  task={item}
                  className={`mb-2 ${backgroundClass}`} // Add background color via className
                  onClick={() => router.push(hm_uris.stack.tasks_id(item.id))}
               />
            )
         }}
      />
   )
}

export default Page
