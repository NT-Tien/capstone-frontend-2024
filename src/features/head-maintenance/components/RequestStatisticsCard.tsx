"use client"

import { cn } from "@/lib/utils/cn.util"
import { Button, Space } from "antd"
import hd_uris from "@/features/head-department/uri"
import { FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { useRouter } from "next/navigation"
import hm_uris from "@/features/head-maintenance/uri"

type Props = {
   className?: string
}

function RequestStatisticsCard(props: Props) {
   const router = useRouter()
   const api_counts = head_maintenance_queries.dashboard.count({})

   return (
      <article className={cn("w-full text-black", props.className)}>
         <Space.Compact direction="vertical" className="w-full">
            <Button
               block
               className="flex justify-between rounded-none rounded-t-lg py-5 text-sm"
               onClick={() => router.push(hm_uris.navbar.requests + `?status=${"rejected" as FixRequestStatuses}`)}
            >
               <div>Chưa xử lý</div>
               <div>{api_counts.data?.pendingRequests ?? 0}</div>
            </Button>
            <Button
               block
               className="flex justify-between rounded-none py-5 text-sm"
               onClick={() => router.push(hm_uris.navbar.requests + `?status=${"rejected" as FixRequestStatuses}`)}
            >
               <div>Đã xác nhận lỗi</div>
               <div>{api_counts.data?.approvedRequests ?? 0}</div>
            </Button>
            <Button
               block
               className="flex justify-between rounded-none py-5 text-sm"
               onClick={() => router.push(hm_uris.navbar.requests + `?status=${"rejected" as FixRequestStatuses}`)}
            >
               <div>Đang sửa chữa</div>
               <div>{api_counts.data?.inProgressRequests}</div>
            </Button>
            <Button
               block
               className="flex justify-between rounded-none py-5 text-sm"
               onClick={() => router.push(hm_uris.navbar.requests + `?status=${"rejected" as FixRequestStatuses}`)}
            >
               <div>Hoàn thành</div>
               <div>{(api_counts.data?.headConfirmRequests ?? 0) + (api_counts.data?.closedRequests ?? 0)}</div>
            </Button>
            <Button
               block
               className="flex justify-between rounded-none rounded-b-lg py-5 text-sm"
               onClick={() => router.push(hm_uris.navbar.requests + `?status=${"closed" as FixRequestStatuses}`)}
            >
               <div>Từ chối sửa</div>
               <div>{api_counts.data?.rejectedRequests ?? 0}</div>
            </Button>
         </Space.Compact>
      </article>
   )
}

export default RequestStatisticsCard
