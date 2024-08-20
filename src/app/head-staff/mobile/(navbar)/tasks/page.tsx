"use client"

import HeadStaff_Task_All from "@/app/head-staff/_api/task/all.api"
import RootHeader from "@/common/components/RootHeader"
import ScrollableTabs from "@/common/components/ScrollableTabs"
import TaskCard from "@/common/components/TaskCard"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import qk from "@/common/querykeys"
import { Car } from "@phosphor-icons/react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Button, Card, Divider, Empty, List, Result, Skeleton, Spin } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

export default function Page() {
   return (
      <Suspense fallback={<Spin fullscreen />}>
         <TasksPage />
      </Suspense>
   )
}

function TasksPage() {
   const searchParams = useSearchParams()
   const [status, setStatus] = useState<TaskStatus>(TaskStatus.AWAITING_FIXER)
   const page = Number(searchParams.get("page")) ?? 1
   const limit = 5

   const result = useInfiniteQuery({
      queryKey: qk.task.all(page, limit, status),
      queryFn: (req) => HeadStaff_Task_All({ page: req.pageParam, limit, status }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
         return lastPageParam + 1
      },
   })

   return (
      <div className="std-layout">
         <RootHeader title="Tác vụ" className="std-layout-outer p-4" />
         <ScrollableTabs
            className="main-tabs std-layout-outer"
            tab={status}
            onTabChange={(e) => {
               setStatus(e as any)
            }}
            classNames={{
               content: "mt-layout",
            }}
            items={[
               {
                  key: TaskStatus.AWAITING_FIXER,
                  title: TaskStatusTagMapper[TaskStatus.AWAITING_FIXER].text,
                  icon: TaskStatusTagMapper[TaskStatus.AWAITING_FIXER].icon,
               },
               {
                  key: TaskStatus.ASSIGNED,
                  title: TaskStatusTagMapper[TaskStatus.ASSIGNED].text,
                  icon: TaskStatusTagMapper[TaskStatus.ASSIGNED].icon,
               },
               {
                  key: TaskStatus.IN_PROGRESS,
                  title: TaskStatusTagMapper[TaskStatus.IN_PROGRESS].text,
                  icon: TaskStatusTagMapper[TaskStatus.IN_PROGRESS].icon,
               },
               {
                  key: TaskStatus.COMPLETED,
                  title: TaskStatusTagMapper[TaskStatus.HEAD_STAFF_CONFIRM].text, // TODO temporary replacement
                  icon: TaskStatusTagMapper[TaskStatus.HEAD_STAFF_CONFIRM].icon,
               },
               {
                  key: TaskStatus.HEAD_STAFF_CONFIRM,
                  title: TaskStatusTagMapper[TaskStatus.COMPLETED].text,
                  icon: TaskStatusTagMapper[TaskStatus.COMPLETED].icon,
               },
               {
                  key: TaskStatus.CANCELLED,
                  title: TaskStatusTagMapper[TaskStatus.CANCELLED].text,
                  icon: TaskStatusTagMapper[TaskStatus.CANCELLED].icon,
               },
            ]}
         />

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
            renderItem={(item) => (
               <TaskCard
                  task={item}
                  className="mb-2"
                  onClick={() => router.push(`/head-staff/mobile/tasks/${item.id}`)}
               />
            )}
         />
   )
}
