"use client"

import head_maintenance_queries from "@/features/head-maintenance/queries"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils/cn.util"
import { Button, Space } from "antd"
import hd_uris from "@/features/head-department/uri"
import { FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import hm_uris from "@/features/head-maintenance/uri"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"

type Props = {
   className?: string
}

function TaskStatisticsCard(props: Props) {
   const router = useRouter()
   const api_counts = head_maintenance_queries.dashboard.count({})

   return (
      <article className={cn("w-full text-black", props.className)}>
         <Space.Compact direction="vertical" className="w-full">
            <Button
               block
               className="flex justify-between rounded-none rounded-t-lg py-5 text-sm"
               onClick={() => router.push(hm_uris.navbar.tasks + `?status=${TaskStatus.AWAITING_SPARE_SPART}`)}
            >
               <div>Chờ linh kiện</div>
               <div>{api_counts.data?.awaitingSparePartTasks ?? 0}</div>
            </Button>
            <Button
               block
               className="flex justify-between rounded-none py-5 text-sm"
               onClick={() => router.push(hm_uris.navbar.tasks + `?status=${TaskStatus.AWAITING_FIXER}`)}
            >
               <div>Chưa phân công</div>
               <div>{api_counts.data?.awaitingFixerTasks ?? 0}</div>
            </Button>
            <Button
               block
               className="flex justify-between rounded-none py-5 text-sm"
               onClick={() => router.push(hm_uris.navbar.tasks + `?status=${TaskStatus.ASSIGNED}`)}
            >
               <div>Chưa bắt đầu</div>
               <div>{api_counts.data?.assignedTasks}</div>
            </Button>
            <Button
               block
               className="flex justify-between rounded-none py-5 text-sm"
               onClick={() => router.push(hm_uris.navbar.tasks + `?status=${TaskStatus.IN_PROGRESS}`)}
            >
               <div>Đang thực hiện</div>
               <div>{api_counts.data?.inProgressTasks ?? 0}</div>
            </Button>
            <Button
               block
               className="flex justify-between rounded-none py-5 text-sm"
               onClick={() => router.push(hm_uris.navbar.tasks + `?status=${TaskStatus.HEAD_STAFF_CONFIRM}`)}
            >
               <div>Chờ kiểm tra</div>
               <div>{api_counts.data?.headStaffConfirmTasks ?? 0}</div>
            </Button>
            <Button
               block
               className="flex justify-between rounded-none rounded-b-lg py-5 text-sm"
               onClick={() => router.push(hm_uris.navbar.tasks + `?status=${TaskStatus.COMPLETED}`)}
            >
               <div>Đã hoàn thành</div>
               <div>{api_counts.data?.completedTasks ?? 0}</div>
            </Button>
         </Space.Compact>
      </article>
   )
}

export default TaskStatisticsCard
