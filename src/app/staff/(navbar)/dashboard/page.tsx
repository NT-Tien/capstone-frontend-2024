"use client"

import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_All from "@/app/staff/_api/task/all.api"
import TaskCard from "@/app/staff/_components/TaskCard"
import TaskDetailsDrawer from "@/app/staff/_components/TaskDetails.drawer"
import HomeHeader from "@/common/components/HomeHeader"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { CalendarOutlined, CheckSquareOutlined, ClockCircleOutlined } from "@ant-design/icons"
import { StatisticCard } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, Empty, Typography } from "antd"
import Link from "next/link"
import { useMemo } from "react"
import CountUp from "react-countup"
import dayjs from "dayjs"

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

   const tasksToday = useMemo(() => {
      if (!response.isSuccess) return []
      return response.data?.filter((task: TaskDto) => dayjs(task.fixerDate).isSame(dayjs(), "day"))
   }, [response.data, response.isSuccess])

   return (
      <div className="std-layout">
         <HomeHeader className="pb-8 pt-4" />
         {ongoingtask && (
            <section className="mb-8 flex space-x-4">
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
         )}
         <section className="std-layout-inner flex items-center justify-between space-x-3">
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               loading={response.isLoading}
               bodyStyle={{
                  padding: "1rem",
               }}
               statistic={{
                  title: "Tổng",
                  value: response.data?.length ?? 0,
                  suffix: <span className="ml-1 text-sm text-neutral-600">tác vụ</span>,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               bodyStyle={{
                  padding: "1rem",
               }}
               loading={response.isLoading}
               statistic={{
                  title: "Cần làm",
                  value: response.data?.filter((value: TaskDto) => value.status === TaskStatus.ASSIGNED).length ?? 0,
                  suffix: <span className="ml-1 text-sm text-neutral-600">tác vụ</span>,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
            <StatisticCard
               className="h-full w-full flex-1 shadow-fb"
               loading={response.isLoading}
               bodyStyle={{
                  padding: "1rem",
               }}
               statistic={{
                  title: "Hoàn tất",
                  value: response.data?.filter((value: TaskDto) => value.status === TaskStatus.COMPLETED).length ?? 0,
                  suffix: <span className="ml-1 text-sm text-neutral-600">tác vụ</span>,
                  formatter: (value) => <CountUp end={value as number} separator={","} />,
               }}
            />
         </section>
         <section className="std-layout-inner mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <CalendarOutlined />
               <h2 className="text-lg font-semibold">Tác vụ hôm nay</h2>
            </div>
            <Link href="/staff/tasks">
               <Button type="link" className="p-0">
                  Xem thêm
               </Button>
            </Link>
         </section>
         <div>
            {tasksToday.length === 0 ? (
               <Card className="mt-1.5">
                  <Empty description="Không có tác vụ" />
               </Card>
            ) : (
               tasksToday.map((task) => (
                  <TaskCard
                     className="std-layout-inner mt-1.5 grid grid-cols-1 gap-3"
                     title={task.name}
                     description={`Est. ${task.totalTime} minutes`}
                     key={task.id}
                     extra={
                        <Typography.Text className="text-gray-500">
                           {dayjs(task.createdAt).add(7, "hours").locale("vi").fromNow(false)}
                        </Typography.Text>
                     }
                  />
               ))
            )}
         </div>
      </div>
   )
}
