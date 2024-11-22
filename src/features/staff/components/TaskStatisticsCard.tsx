"use client"

import staff_uri from "@/features/staff/uri"
import { Button, Space } from "antd"
import { useRouter } from "next/navigation"

type Props = {
   counts: {
      AWAITING_FIXER: number
      AWAITING_SPARE_SPART: number
      ASSIGNED: number
      IN_PROGRESS: number
      HEAD_STAFF_CONFIRM: number
      COMPLETED: number
      CANCELLED: number
   }
}

function TaskStatisticsCard(props: Props) {
   const router = useRouter()

   return (
      <article className="w-full text-black">
         <Space.Compact className="w-full">
            <Button block className="grid h-max place-items-center gap-0 rounded-none rounded-tl-lg py-4 text-base" onClick={() => router.push(staff_uri.navbar.tasks)}>
               <div>{props.counts.ASSIGNED}</div>
               <div>Chưa thực hiện</div>
            </Button>
            <Button block className="grid h-max place-items-center gap-0 rounded-none rounded-tr-lg py-4 text-base" onClick={() => router.push(staff_uri.navbar.tasks)}>
               <div>{props.counts.COMPLETED}</div>
               <div>Hoàn thành</div>
            </Button>
         </Space.Compact>
         <Space.Compact direction="vertical" className="w-full">
            <Button block className="flex justify-between rounded-none py-5 text-sm" onClick={() => router.push(staff_uri.navbar.tasks)}>
               <div>Chờ kiểm tra</div>
               <div>{props.counts.HEAD_STAFF_CONFIRM}</div>
            </Button>
            <Button block className="flex justify-between rounded-none rounded-b-lg py-5 text-sm" onClick={() => router.push(staff_uri.navbar.tasks)}>
               <div>Đã hủy</div>
               <div>{props.counts.CANCELLED}</div>
            </Button>
         </Space.Compact>
      </article>
   )
}

export default TaskStatisticsCard
