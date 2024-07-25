"use client"

import RootHeader from "@/common/components/RootHeader"
import { Button, Card, Divider, List, Tabs, Tag, Typography } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { useInfiniteQuery } from "@tanstack/react-query"
import HeadStaff_Task_All from "@/app/head-staff/_api/task/all.api"
import qk from "@/common/querykeys"
import { TaskDto } from "@/common/dto/Task.dto"
import { RightOutlined, RobotOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { useTranslation } from "react-i18next"
import { cn } from "@/common/util/cn.util"
import extended_dayjs from "@/config/dayjs.config"
import { MapPin, Robot } from "@phosphor-icons/react"

export default function TasksPage() {
   const searchParams = useSearchParams()
   const status: TaskStatus = (searchParams.get("status") as TaskStatus) ?? TaskStatus.AWAITING_FIXER
   const page = Number(searchParams.get("page")) ?? 1
   const limit = 5
   const router = useRouter()
   const { t } = useTranslation()

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
         <Tabs
            className="main-tabs std-layout-outer"
            onChange={(e) => {
               router.push(`/head-staff/mobile/tasks?status=${e}`)
            }}
            defaultActiveKey={status}
            items={[
               {
                  key: TaskStatus.AWAITING_FIXER,
                  label: "Đang chờ",
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
                  label: "Đã phân công",
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
                  label: "Đang thực hiện",
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
                  label: "Hoàn thành",
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
   const { t } = useTranslation()
   const router = useRouter()
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
            <Card
               key={item.id}
               title={
                  <Typography.Text className="mb-0" ellipsis>
                     {item.name}
                  </Typography.Text>
               }
               extra={
                  <div className="flex items-center gap-2">
                     <span className="text-xs text-gray-500">
                        {extended_dayjs(item.createdAt).add(7, "hours").format("DD/MM/YY HH:mm")}
                     </span>
                     <Button icon={<RightOutlined />} size="small" type="text" />
                  </div>
               }
               size="small"
               className={cn(item.priority ? "border-red-500 bg-red-100" : "border-gray-300", "mb-2 border-l-4")}
               hoverable={true}
               onClick={() => router.push(`/head-staff/mobile/tasks/${item.id}`)}
            >
               <ProDescriptions
                  size="small"
                  dataSource={item}
                  colon={false}
                  columns={[
                     {
                        key: "mm",
                        label: "Mẫu máy",
                        render: (_, e) => e.device?.machineModel.name ?? "-",
                     },
                     {
                        key: "location",
                        label: "Vị trí",
                        render: (_, e) =>
                           `${e.device?.area.name ?? "-"} (${e.device?.positionX}x${e.device?.positionY})`,
                     },
                     {
                        key: "fixer",
                        label: "Thợ sửa chữa",
                        render: (_, e) => e.fixer?.username ?? "-",
                        hide: item.fixer === undefined,
                        className: !item.fixer ? "hidden" : "",
                     },
                  ]}
               />
            </Card>
         )}
      />
   )
}
