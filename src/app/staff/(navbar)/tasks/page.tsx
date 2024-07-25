"use client"

import RootHeader from "@/common/components/RootHeader"
import { Empty, Skeleton, Spin, Tabs, Typography } from "antd"
import { useQuery } from "@tanstack/react-query"
import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_All from "@/app/staff/_api/task/all.api"
import { useRouter, useSearchParams } from "next/navigation"
import { TaskDto } from "@/common/dto/Task.dto"
import TaskCard from "@/app/staff/_components/TaskCard"
import { CSSProperties, useMemo } from "react"
import { cn } from "@/common/util/cn.util"
import dayjs from "dayjs"
import extended_dayjs from "@/config/dayjs.config"
import { TaskStatus } from "@/common/enum/task-status.enum"
import TaskDetailsDrawer from "@/app/staff/_components/TaskDetails.drawer"

export default function StaffTasksPage() {
   const searchParams = useSearchParams()

   const response = useQuery({
      queryKey: staff_qk.task.all(),
      queryFn: Staff_Task_All,
   })

   const tasksInGroups = useMemo(() => {
      const result: { priority: TaskDto[]; normal: TaskDto[] } = { priority: [], normal: [] }

      if (!response.isSuccess) return result

      response.data.reverse().forEach((task) => {
         if (task.status !== TaskStatus.ASSIGNED) return // ongoing tasks will be shown on top only, not in the list

         if (task.priority) {
            result.priority.push(task)
         } else {
            result.normal.push(task)
         }
      })

      result.priority.sort((a, b) => (dayjs(a.createdAt).add(7, "hours").isBefore(dayjs(b.createdAt).add(7, "hours")) ? 1 : -1))
      result.normal.sort((a, b) => (dayjs(a.createdAt).add(7, "hours").isBefore(dayjs(b.createdAt).add(7, "hours")) ? 1 : -1))

      return result
   }, [response.data, response.isSuccess])

   const ongoingTask = useMemo(() => {
      if (!response.isSuccess) return null

      const currentResult = response.data.filter((task) => task.status === TaskStatus.IN_PROGRESS)

      if (currentResult.length > 0) return currentResult[0]

      return null
   }, [response.data, response.isSuccess])

   const latestTaskId = useMemo(() => {
      return tasksInGroups.priority[0]?.id ?? tasksInGroups.normal[0]?.id ?? null
   }, [tasksInGroups.normal, tasksInGroups.priority])

   return (
      <TaskDetailsDrawer>
         {(handleOpen) => (
            <div className="std-layout">
               <RootHeader title="Tác vụ" className="std-layout-outer p-4" />
               {ongoingTask && (
                  <section className="shadow-bottom std-layout-outer w-full bg-white p-layout">
                     <TaskCard
                        title="Tác vụ cần thực hiện"
                        description={ongoingTask.name ?? ""}
                        priority={ongoingTask.priority ?? false}
                        onClick={() => handleOpen(ongoingTask.id ?? "", true)}
                     />
                  </section>
               )}
               {tasksInGroups.normal.length === 0 && tasksInGroups.priority.length === 0 ? (
                  <div className="mt-layout h-full">
                     <Empty description={"Bạn không còn tác vụ"} />
                  </div>
               ) : (
                  <div className={"mt-layout"}>
                     <DetailedListRenderer
                        hasOngoingTask={ongoingTask !== null}
                        enabledTaskId={latestTaskId}
                        data={tasksInGroups.priority}
                        loading={response.isLoading}
                        showEmpty={false}
                        onItemClick={handleOpen}
                        className="mb-3"
                     />
                     <DetailedListRenderer
                        hasOngoingTask={ongoingTask !== null}
                        enabledTaskId={latestTaskId}
                        data={tasksInGroups.normal}
                        loading={response.isLoading}
                        showEmpty={false}
                        onItemClick={handleOpen}
                     />
                  </div>
               )}
            </div>
         )}
      </TaskDetailsDrawer>
   )
}

type ListRendererProps = {
   data: TaskDto[] | undefined
   enabledTaskId: string | null
   loading: boolean
   hasOngoingTask: boolean
   onItemClick: (taskId: string) => void
   style?: CSSProperties
   className?: string
   emptyText?: string
   showEmpty?: boolean
}

function DetailedListRenderer(props: ListRendererProps) {
   const router = useRouter()

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
            <Empty description={props.emptyText ?? "Không còn tác vụ"} />
         </div>
      )
   }

   return (
      <div className={cn("grid grid-cols-1 gap-3", props.className)} style={props.style}>
         {props.data.map((task) => (
            <TaskCard
               title={task.name}
               description={`Est. ${task.totalTime} minutes`}
               disabled={task.id !== props.enabledTaskId || props.hasOngoingTask}
               disabledTooltipText={
                  task.id !== props.enabledTaskId
                     ? "Bạn có một nhiệm vụ cũ/quan trọng hơn cần hoàn thành. Vui lòng hoàn tất nhiệm vụ đó trước."
                     : props.hasOngoingTask
                       ? "Bạn đang có nhiệm vụ cần hoàn thành. Vui lòng hoàn tất nhiệm vụ."
                       : ""
               }
               key={task.id}
               priority={task.priority}
               extra={
                  <Typography.Text className="text-gray-500">
                     {extended_dayjs(task.createdAt).add(7, "hours").locale("en").fromNow(false)}
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
