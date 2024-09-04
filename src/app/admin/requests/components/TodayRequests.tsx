"use client"

import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { CheckCircle, Prohibit, Tray } from "@phosphor-icons/react"
import { useQueries } from "@tanstack/react-query"
import Card from "antd/es/card"
import Statistic from "antd/es/statistic"
import { useMemo } from "react"
import CountUp from "react-countup"
import { admin_qk } from "../../_api/qk"
import Admin_Requests_All from "../../_api/requests/all.api"
import dayjs from "dayjs"

export default function TodayRequests() {
   const api = useQueries({
      queries: [
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.PENDING, time: 1 }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.PENDING, time: 1 }),
         },
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.APPROVED, time: 1 }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.APPROVED, time: 1 }),
         },
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.IN_PROGRESS, time: 1 }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.IN_PROGRESS, time: 1 }),
         },
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.HEAD_CONFIRM, time: 1 }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.HEAD_CONFIRM, time: 1 }),
         },
         {
            queryKey: admin_qk.requests.all({ page: 1, limit: 500, status: FixRequestStatus.REJECTED, time: 1 }),
            queryFn: () => Admin_Requests_All({ page: 1, limit: 500, status: FixRequestStatus.REJECTED, time: 1 }),
         },
      ],
      combine: (result) => {
         return {
            pending: result[0],
            approved: result[1],
            in_progress: result[2],
            head_confirm: result[3],
            rejected: result[4],
         }
      },
   })

   const counts = useMemo(() => {
      if (!api.pending.isSuccess || !api.approved.isSuccess || !api.head_confirm.isSuccess || !api.rejected.isSuccess)
         return null

      let returnValue = {
         today: {
            pending: 0,
            approved: 0,
            head_confirm: 0,
            rejected: 0,
         },
         yesterday: {
            pending: 0,
            approved: 0,
            head_confirm: 0,
            rejected: 0,
         },
      }

      const today = dayjs()
      const yesterday = dayjs().subtract(1, "day")

      api.pending.data.list.forEach((item) => {
        if(dayjs(item.createdAt).add(7, "hours").isSame(today, "day")) returnValue.today.pending++
        if(dayjs(item.createdAt).add(7, "hours").isSame(yesterday, "day")) returnValue.yesterday.pending++
      })

      api.approved.data.list.forEach((item) => {
        if(dayjs(item.createdAt).add(7, "hours").isSame(today, "day")) returnValue.today.approved++
        if(dayjs(item.createdAt).add(7, "hours").isSame(yesterday, "day")) returnValue.yesterday.approved++
      })

      api.head_confirm.data.list.forEach((item) => {
        if(dayjs(item.createdAt).add(7, "hours").isSame(today, "day")) returnValue.today.head_confirm++
        if(dayjs(item.createdAt).add(7, "hours").isSame(yesterday, "day")) returnValue.yesterday.head_confirm++
      })

      api.rejected.data.list.forEach((item) => {
        if(dayjs(item.createdAt).add(7, "hours").isSame(today, "day")) returnValue.today.rejected++
        if(dayjs(item.createdAt).add(7, "hours").isSame(yesterday, "day")) returnValue.yesterday
      })

      return returnValue
   }, [
      api.approved.data?.list,
      api.approved.isSuccess,
      api.head_confirm.data?.list,
      api.head_confirm.isSuccess,
      api.pending.data?.list,
      api.pending.isSuccess,
      api.rejected.data?.list,
      api.rejected.isSuccess,
   ])

   return (
      <>
         <Card className="w-full">
            <div className="flex justify-between items-start">
                <Statistic
                   title="Chưa xử lý"
                   value={counts?.today.pending}
                   precision={2}
                   formatter={(value) => <CountUp end={value as number} separator="," />}
                   suffix={<RenderChangeArrow num1={counts?.today.pending} num2={counts?.yesterday.pending} />}
                />
                <Tray size={36} />
            </div>
         </Card>
         <Card className="w-full">
            <div className="flex justify-between items-start">
                <Statistic
                   title="Đã duyệt"
                   value={counts?.today.approved}
                   precision={2}
                   formatter={(value) => <CountUp end={value as number} separator="," />}
                   suffix={<RenderChangeArrow num1={counts?.today.approved} num2={counts?.yesterday.approved} />}
                />
                <CheckCircle size={36} />
            </div>
         </Card>
         <Card className="w-full">
            <div className="flex justify-between items-start">
                <Statistic
                   title="Đã hủy"
                   value={counts?.today.rejected}
                   precision={2}
                   formatter={(value) => <CountUp end={value as number} separator="," />}
                   suffix={<RenderChangeArrow num1={counts?.today.rejected} num2={counts?.yesterday.rejected} />}
                />
                <Prohibit size={36} />
            </div>
         </Card>
      </>
   )
}

function calculatePercentageDifference(newValue?: number, originalValue?: number): number {
    if (originalValue === undefined || newValue === undefined) {
      return 0.0; // No change
    } else
    if (originalValue === 0 && newValue === 0) {
      return 0.0; // No change
    } else if (originalValue === 0) {
      return 100.0; // Consider this an infinite increase
    } else if (newValue === 0) {
      return -100.0; // Consider this a complete decrease
    } else {
      const difference = newValue - originalValue;
      const percentageChange = (difference / originalValue) * 100;
      return percentageChange;
    }
  }
  

function RenderChangeArrow({ num1, num2 }: { num1?: number; num2?: number }) {
   const percentage = calculatePercentageDifference(num1, num2)

   if (percentage > 0) return <span className="text-sm text-green-500">↑ {percentage}%</span>

   if (percentage < 0) return <span className="text-sm text-red-500">↓ {percentage}%</span>

   return <span className="text-sm text-neutral-500">- {percentage}%</span>
}
