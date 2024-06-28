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
import { useTranslation } from "react-i18next"

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
                  label: t('Inbox'),
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
                  label: t('Assigned'),
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
                  label: t('Progressing'),
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
                  label: t('Completed'),
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
               <Divider className="text-sm">{t('endList')}</Divider>
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
                        label: t('MachineModel'),
                        render: (_, e) => e.device?.machineModel.name ?? "-",
                     },
                     {
                        key: "Created",
                        label: t('Created'),
                        render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                     },
                     {
                        key: "priority",
                        label: t('Priority'),
                        render: (_, e) => (e.priority ? <Tag color="red">{t('High')}</Tag> : <Tag color="green">{t('Low')}</Tag>),
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
