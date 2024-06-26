"use client"

import RootHeader from "@/common/components/RootHeader"
import { Button, Card, Divider, List, Tabs, Tag } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { useInfiniteQuery } from "@tanstack/react-query"
import HeadStaff_Task_All from "@/app/head-staff/_api/task/all.api"
import qk from "@/common/querykeys"
import { TaskDto } from "@/common/dto/Task.dto"
import { RightOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"

export default function TasksPage() {
   const searchParams = useSearchParams()
   const status: TaskStatus = (searchParams.get("status") as TaskStatus) ?? TaskStatus.AWAITING_FIXER
   const page = Number(searchParams.get("page")) ?? 1
   const limit = 5
   const router = useRouter()

   const result = useInfiniteQuery({
      queryKey: qk.task.all(page, limit, status),
      queryFn: (req) => HeadStaff_Task_All({ page: req.pageParam, limit, status }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
         return lastPageParam + 1
      },
   })

   return (
      <div
         style={{
            display: "grid",
            gridTemplateColumns: "[outer-start] 16px [inner-start] 1fr [inner-end] 16px [outer-end] 0",
         }}
      >
         <RootHeader
            title="Tasks"
            className="p-4"
            style={{
               gridColumn: "outer-start / outer-end",
            }}
         />
         <Tabs
            style={{
               gridColumn: "inner-start / inner-end",
            }}
            onChange={(e) => {
               router.push(`/head-staff/tasks?status=${e}`)
            }}
            defaultActiveKey={status}
            items={[
               {
                  key: TaskStatus.AWAITING_FIXER,
                  label: "Inbox",
                  children: (
                     <ListView
                        total={result.data?.pages[0].total ?? 0}
                        loadMore={result.fetchNextPage}
                        loading={result.isLoading}
                        items={result.data?.pages.flatMap((res) => res.list) ?? []}
                     />
                  ),
               },
               {
                  key: TaskStatus.ASSIGNED,
                  label: "Assigned",
                  children: (
                     <ListView
                        total={result.data?.pages[0].total ?? 0}
                        loadMore={result.fetchNextPage}
                        loading={result.isLoading}
                        items={result.data?.pages.flatMap((res) => res.list) ?? []}
                     />
                  ),
               },
               {
                  key: TaskStatus.IN_PROGRESS,
                  label: "In Progress",
                  children: (
                     <ListView
                        total={result.data?.pages[0].total ?? 0}
                        loadMore={result.fetchNextPage}
                        loading={result.isLoading}
                        items={result.data?.pages.flatMap((res) => res.list) ?? []}
                     />
                  ),
               },
               {
                  key: TaskStatus.COMPLETED,
                  label: "Completed",
                  children: (
                     <ListView
                        total={result.data?.pages[0].total ?? 0}
                        loadMore={result.fetchNextPage}
                        loading={result.isLoading}
                        items={result.data?.pages.flatMap((res) => res.list) ?? []}
                     />
                  ),
               },
            ]}
         />
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
   return (
      <List
         loading={props.loading}
         loadMore={
            props.items.length !== 0 &&
            (props.total === props.items.length ? (
               <Divider className="text-sm">You&apos;re at the end of the list</Divider>
            ) : (
               <Button onClick={props.loadMore}>Load More</Button>
            ))
         }
         dataSource={props.items}
         itemLayout={"horizontal"}
         size={"small"}
         renderItem={(item) => (
            <Card
               key={item.id}
               title={item.name}
               extra={<Button icon={<RightOutlined />} size="small" type="text" />}
               size="small"
               className="mb-3"
               hoverable={true}
               onClick={() => router.push(`/head-staff/tasks/${item.id}`)}
            >
               <ProDescriptions
                  size="small"
                  dataSource={item}
                  columns={[
                     {
                        key: "mm",
                        label: "Machine Model",
                        render: (_, e) => e.device?.machineModel.name ?? "-",
                     },
                     {
                        key: "Created",
                        label: "Created",
                        render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                     },
                     {
                        key: "priority",
                        label: "Priority",
                        render: (_, e) => (e.priority ? <Tag color="red">High</Tag> : <Tag color="green">Low</Tag>),
                     },
                  ]}
               />
            </Card>
         )}
      />
      // <div className="grid grid-cols-1 gap-3">
      //    {props.items.map((item) => (
      //    ))}
      // </div>
   )
}
