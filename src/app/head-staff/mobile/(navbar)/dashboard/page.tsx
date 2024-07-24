"use client"

import HomeHeader from "@/common/components/HomeHeader"
import { useQuery } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Task_All from "@/app/head-staff/_api/task/all.api"
import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { StatisticCard } from "@ant-design/pro-components"
import CountUp from "react-countup"
import { useTranslation } from "react-i18next"
import { ClockCircleOutlined } from "@ant-design/icons"
import Link from "next/link"
import { Button, Typography } from "antd"
import TaskCard from "@/app/staff/_components/TaskCard"
import extended_dayjs from "@/config/dayjs.config"
import { Metadata } from "next"

function useTask(current: number, pageSize: number, status: TaskStatus) {
   return useQuery({
      queryKey: headstaff_qk.task.all({
         page: current.toString(),
         limit: pageSize.toString(),
         status,
      }),
      queryFn: () =>
         HeadStaff_Task_All({
            page: current,
            limit: pageSize,
            status,
         }),
   })
}

export default function DashboardPage() {
   const { t } = useTranslation()
   const currentDefault = 1,
      pageSizeDefault = 10

   const searchParams = useSearchParams()
   const [current, setCurrent] = useState(Number(searchParams.get("current")) || currentDefault)
   const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || pageSizeDefault)

   const awaitingFixerResult = useTask(current, pageSize, TaskStatus.AWAITING_FIXER)
   // const pendingStockResult = result(TaskStatus.PENDING_STOCK)
   const assignedResult = useTask(current, pageSize, TaskStatus.ASSIGNED)
   const inProgressResult = useTask(current, pageSize, TaskStatus.IN_PROGRESS)
   const completedResult = useTask(current, pageSize, TaskStatus.COMPLETED)
   const cancelledResult = useTask(current, pageSize, TaskStatus.CANCELLED)

   const totalTasks = [
      awaitingFixerResult.data?.total ?? 0,
      // pendingStockResult.data?.total ?? 0,
      assignedResult.data?.total ?? 0,
      inProgressResult.data?.total ?? 0,
      completedResult.data?.total ?? 0,
      cancelledResult.data?.total ?? 0,
   ].reduce((acc, curr) => acc + curr, 0)

   const progressingTasks = inProgressResult.data?.list.length ?? 0
   const completedTasks = completedResult.data?.list.length ?? 0
   return (
      <div className="std-layout">
         <HomeHeader className="std-layout-inner pb-8 pt-4" />
         <section className="flex space-x-4">
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               loading={
                  awaitingFixerResult.isLoading ||
                  assignedResult.isLoading ||
                  inProgressResult.isLoading ||
                  completedResult.isLoading ||
                  cancelledResult.isLoading
               }
               statistic={{
                  title: t("Total"),
                  value: totalTasks,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               loading={inProgressResult.isLoading}
               statistic={{
                  title: "Tiến hành",
                  value: progressingTasks,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               loading={completedResult.isLoading}
               statistic={{
                  title: "Hoàn tất",
                  value: completedTasks,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
         </section>
         <section className="std-layout-inner mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ClockCircleOutlined />
               <h2 className="text-lg font-semibold">{t("PrevReports")}</h2>
            </div>
            <Link href="/head-staff/mobile/tasks">
               <Button type="link" className="p-0">
                  {t("SeeMore")}
               </Button>
            </Link>
         </section>
         <div>
            {completedResult.data?.list.map((task) => (
               <TaskCard
                  className="std-layout-inner mt-2.5 grid grid-cols-1 gap-10"
                  title={task.name}
                  description={`Est. ${task.totalTime} minutes`}
                  key={task.id}
                  extra={
                     <Typography.Text className="text-gray-500">
                        {extended_dayjs(task.createdAt).locale("en").fromNow(false)}
                     </Typography.Text>
                  }
               />
            ))}
         </div>
      </div>
   )
}
