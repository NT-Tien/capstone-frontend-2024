"use client"

import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_All from "@/app/staff/_api/task/all.api"
import TaskCard from "@/app/staff/_components/TaskCard"
import TaskDetailsDrawer from "@/app/staff/_components/TaskDetails.drawer"
import HomeHeader from "@/common/components/HomeHeader"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus } from "@/common/enum/task-status.enum"
import extended_dayjs from "@/config/dayjs.config"
import { ClockCircleOutlined } from "@ant-design/icons"
import { StatisticCard } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import { Button, Typography } from "antd"
import Link from "next/link"
import { useMemo } from "react"
import CountUp from "react-countup"

export default function StaffDashboard() {
   const response = useQuery({
      queryKey: staff_qk.task.all(),
      queryFn: Staff_Task_All,
   })

   const ongoingtask = useMemo(() => {
      if (!response.isSuccess) return
      const result = response.data?.filter((task) => task.status === TaskStatus.IN_PROGRESS)
      if (result.length > 0) return result[0]
      return null
   }, [response.data, response.isSuccess])

   const completedTasks = useMemo(() => {
      if (!response.isSuccess) return []
      return response.data?.filter((task: TaskDto) => task.status === TaskStatus.COMPLETED)
   }, [response.data, response.isSuccess])

   return (
      <div className="std-layout">
         <HomeHeader className="pb-8 pt-4" />
         <section className="flex space-x-4">
            <TaskDetailsDrawer>
               {(handleOpen) => (
                  <TaskCard
                     className="h-full w-full flex-1 shadow-fb"
                     title="Tác vụ đang thực hiện"
                     description={ongoingtask?.name ?? ""}
                     priority={ongoingtask?.priority ?? false}
                     onClick={() => handleOpen(ongoingtask?.id ?? "", true)}
                  />
               )}
            </TaskDetailsDrawer>
         </section>
         <section className="std-layout-inner mt-8 flex items-center justify-between space-x-4">
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               loading={response.isLoading}
               statistic={{
                  title: "Tổng",
                  value: response.data?.length ?? 0,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               loading={response.isLoading}
               statistic={{
                  title: "Cần làm",
                  value: response.data?.filter((value: TaskDto) => value.status === TaskStatus.ASSIGNED).length ?? 0,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               loading={response.isLoading}
               statistic={{
                  title: "Hoàn tất",
                  value: response.data?.filter((value: TaskDto) => value.status === TaskStatus.COMPLETED).length ?? 0,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
         </section>
         <section className="std-layout-inner mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ClockCircleOutlined />
               <h2 className="text-lg font-semibold">Báo cáo gần đây</h2>
            </div>
            <Link href="/staff/tasks">
               <Button type="link" className="p-0">
                  Xem thêm
               </Button>
            </Link>
         </section>
         <div>
            {completedTasks.map((task) => (
               <TaskCard
                  className="std-layout-inner mt-1.5 grid grid-cols-1 gap-3"
                  title={task.name}
                  description={`Est. ${task.totalTime} minutes`}
                  key={task.id}
                  extra={
                     <Typography.Text className="text-gray-500">
                        {extended_dayjs(task.createdAt).add(7, "hours").locale("en").fromNow(false)}
                     </Typography.Text>
                  }
               />
            ))}
         </div>
      </div>
   )
}
