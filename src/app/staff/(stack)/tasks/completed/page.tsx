"use client"

import RootHeader from "@/components/layout/RootHeader"
import { LeftOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import staff_qk from "@/features/staff/api/qk"
import Staff_Task_All from "@/features/staff/api/task/all.api"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { Empty, Skeleton, Spin, Typography } from "antd"
import { cn } from "@/lib/utils/cn.util"
import TaskCard from "@/features/staff/components/TaskCard"
import extended_dayjs from "@/config/dayjs.config"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { CSSProperties } from "react"
import TaskDetailsDrawer from "@/features/staff/components/overlays/TaskDetails.drawer"

export default function CompletedTasksPage() {
   const router = useRouter()

   const tasks = useQuery({
      queryKey: staff_qk.task.all(),
      queryFn: Staff_Task_All,
      select: (data) => {
         return data.filter((res) => res.status === TaskStatus.COMPLETED)
      },
   })

   return (
      <div className={"std-layout"}>
         <RootHeader
            title={"Completed Tasks"}
            className={"std-layout-outer p-4"}
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
         />
         <TaskDetailsDrawer>
            {(handleOpen) => (
               <Renderer
                  data={tasks.data}
                  loading={tasks.isLoading}
                  onItemClick={(taskId) => handleOpen({ taskId })}
                  className="mt-layout"
               />
            )}
         </TaskDetailsDrawer>
      </div>
   )
}

type RendererProps = {
   data: TaskDto[] | undefined
   loading: boolean
   onItemClick: (taskId: string) => void
   style?: CSSProperties
   className?: string
   emptyText?: string
   showEmpty?: boolean
}

function Renderer(props: RendererProps) {
   if (props.loading)
      return (
         <Spin spinning={props.loading}>
            <Skeleton />
         </Spin>
      )

   if (props.data === undefined || props.data.length === 0) {
      if (!props.showEmpty) return

      return (
         <div className="grid place-items-center py-10">
            <Empty description={props.emptyText ?? "No tasks found"} />
         </div>
      )
   }

   return (
      <div className={cn("grid grid-cols-1 gap-3", props.className)} style={props.style}>
         {props.data.map((task) => (
            <TaskCard
               title={task.name}
               description={`Est. ${task.totalTime} minutes`}
               key={task.id}
               priority={task.priority}
               extra={
                  <Typography.Text className="text-gray-500">
                     {extended_dayjs(task.createdAt).add(7, "hours").fromNow(false)}
                  </Typography.Text>
               }
               onClick={() => {
                  props.onItemClick(task.id)
               }}
            />
         ))}
      </div>
   )
}
