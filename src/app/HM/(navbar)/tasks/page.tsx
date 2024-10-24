"use client"

import HeadStaff_Task_All from "@/features/head-maintenance/api/task/all.api"
import TaskCard from "@/old/TaskCard"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import qk from "@/old/querykeys"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Button, Card, Divider, Empty, Input, List, Result, Select, Skeleton } from "antd"
import { useRouter } from "next/navigation"
import { useState } from "react"
import PageHeader from "@/components/layout/PageHeader"
import { FilterOutlined, SearchOutlined } from "@ant-design/icons"
import HeadMaintenanceNavigaionDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"
import hm_uris from "@/features/head-maintenance/uri"

function Page({ searchParams }: { searchParams: { page?: string; status?: TaskStatus } }) {
   const [status, setStatus] = useState<TaskStatus>(searchParams?.status ?? TaskStatus.AWAITING_FIXER)
   const page = Number(searchParams?.page ?? 1)
   const limit = 5
   const navDrawer = HeadMaintenanceNavigaionDrawer.useDrawer()

   const result = useInfiniteQuery({
      queryKey: qk.task.all(page, limit, status),
      queryFn: (req) => HeadStaff_Task_All({ page: req.pageParam, limit, status }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
         return lastPageParam + 1
      },
   })

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
            <PageHeader
               title="Tác vụ"
               className="std-layout-outer relative z-30"
               icon={PageHeader.NavIcon}
               handleClickIcon={() => navDrawer.handleOpen()}
            />
            <div className="mx-5">
               <Input
                  type="text"
                  className="relative z-30 mb-2 w-full rounded-full border border-neutral-200 bg-neutral-100 px-4 py-3"
                  placeholder="Tìm kiếm"
                  prefix={<SearchOutlined className="mr-2" />}
                  suffix={<FilterOutlined />}
               />
            </div>
         </div>
         <Select
            className="mb-3 mt-2 w-full text-center"
            value={status}
            size="large"
            onChange={(val) => setStatus(val as TaskStatus)}
         >
            {taskStatusOptions.map((option) => (
               <Select.Option key={option.value} value={option.value}>
                  {option.label}
               </Select.Option>
            ))}
         </Select>
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
         <h2 className="mb-2 px-layout text-lg font-semibold">
            <Skeleton paragraph={false} active={result.isPending} loading={result.isPending} />
         </h2>
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
            const backgroundClass = isEven ? "bg-sky-100" : "bg-white"

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
