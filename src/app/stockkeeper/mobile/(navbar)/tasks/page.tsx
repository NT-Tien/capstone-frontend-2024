"use client"

import RootHeader from "@/common/components/RootHeader"
import { Button, Card, Divider, List, Tag } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { useInfiniteQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { TaskDto } from "@/common/dto/Task.dto"
import { RightOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { useTranslation } from "react-i18next"
import Stockkeeper_Task_All from "../../../_api/task/getAll.api"

export default function TasksPage() {
   const searchParams = useSearchParams()
   const page = Number(searchParams.get("page")) ?? 1
   const limit = 5
   const { t } = useTranslation()
   const result = useInfiniteQuery({
      queryKey: qk.task.all(page, limit),
      queryFn: (req) => Stockkeeper_Task_All({ page: req.pageParam, limit }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
         return lastPageParam + 1
      },
   })

   return (
      <div className="std-layout">
         <RootHeader title="Tác vụ" className="std-layout-outer p-4" />
         <div className="mt-3">
            <ListView
               total={result.data?.pages[0].total ?? 0}
               loadMore={result.fetchNextPage}
               loading={result.isLoading}
               items={result.data?.pages.flatMap((res) => res.list) ?? []}
            />
         </div>
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
               title={item.name}
               extra={<Button icon={<RightOutlined />} size="small" type="text" />}
               size="small"
               className="mb-3"
               hoverable={true}
               onClick={() => router.push(`/stockkeeper/mobile/tasks/${item.id}`)}
            >
               <ProDescriptions
                  size="small"
                  dataSource={item}
                  columns={[
                     {
                        key: "mm",
                        label: "Mẫu máy",
                        render: (_, e) => e.device?.machineModel.name ?? "-",
                     },
                     {
                        key: "Created",
                        label: "Ngày tạo",
                        render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                     },
                     {
                        key: "priority",
                        label: "Mức độ ưu tiên",
                        render: (_, e) =>
                           e.priority ? <Tag color="red">Cao</Tag> : <Tag color="green">Thấp</Tag>,
                     },
                  ]}
               />
            </Card>
         )}
      />
   )
}
