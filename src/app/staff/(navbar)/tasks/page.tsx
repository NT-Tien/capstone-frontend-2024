"use client"

import RootHeader from "@/common/components/RootHeader"
import { Divider, Empty, Skeleton, Spin, Tabs, Typography } from "antd"
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
   const tab = searchParams.get("tab") ?? "all"
   const router = useRouter()

   const response = useQuery({
      queryKey: staff_qk.task.all(),
      queryFn: Staff_Task_All,
   })

   const tasksInGroups = useMemo(() => {
      const result: { priority: TaskDto[]; normal: TaskDto[] } = { priority: [], normal: [] }

      if (!response.isSuccess) return result

      response.data.reverse().forEach((task) => {
         if (task.status === TaskStatus.IN_PROGRESS) return // ongoing tasks will be shown on top only, not in the list

         if (task.priority) {
            result.priority.push(task)
         } else {
            result.normal.push(task)
         }
      })

      result.priority.sort((a, b) => (dayjs(a.createdAt).isBefore(dayjs(b.createdAt)) ? 1 : -1))
      result.normal.sort((a, b) => (dayjs(a.createdAt).isBefore(dayjs(b.createdAt)) ? 1 : -1))

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
               <RootHeader title="Tasks" className="std-layout-outer p-4" />
               <Tabs
                  className="std-layout-outer main-tabs"
                  defaultActiveKey={tab}
                  onTabClick={(key) => {
                     router.push(`/staff/tasks?tab=${key}`)
                  }}
                  renderTabBar={(props, DefaultTabBar) => (
                     <>
                        {ongoingTask !== null && (
                           <div className="bg-white px-4 py-1">
                              <TaskCard
                                 title={"Current Task"}
                                 description={ongoingTask.name}
                                 priority={ongoingTask.priority}
                                 className="my-1 bg-[#fcfcfc]"
                                 onClick={() => handleOpen(ongoingTask.id, true)}
                              />
                           </div>
                        )}
                        <DefaultTabBar {...props} />
                     </>
                  )}
                  items={[
                     {
                        key: "all",
                        label: `All (${tasksInGroups.normal.length + tasksInGroups.priority.length ?? 0})`,
                        children: (
                           <>
                              {/*<Divider className="my-2">Priority</Divider>*/}
                              <DetailedListRenderer
                                 hasOngoingTask={ongoingTask !== null}
                                 enabledTaskId={latestTaskId}
                                 data={tasksInGroups.priority}
                                 loading={response.isLoading}
                                 showEmpty={false}
                                 onItemClick={handleOpen}
                              />
                              {/*<Divider className="my-2 mt-6">Normal</Divider>*/}
                              <DetailedListRenderer
                                 hasOngoingTask={ongoingTask !== null}
                                 enabledTaskId={latestTaskId}
                                 data={tasksInGroups.normal}
                                 loading={response.isLoading}
                                 showEmpty={false}
                                 onItemClick={handleOpen}
                              />
                           </>
                        ),
                     },
                     {
                        key: "high",
                        label: `Priority (${tasksInGroups.priority.length})`,
                        children: (
                           <DetailedListRenderer
                              hasOngoingTask={ongoingTask !== null}
                              enabledTaskId={latestTaskId}
                              loading={response.isLoading}
                              data={tasksInGroups.priority}
                              emptyText={"You have no priority tasks"}
                              onItemClick={handleOpen}
                           />
                        ),
                     },
                     {
                        key: "low",
                        label: `Normal (${tasksInGroups.normal.length})`,
                        children: (
                           <DetailedListRenderer
                              hasOngoingTask={ongoingTask !== null}
                              enabledTaskId={latestTaskId}
                              loading={response.isLoading}
                              data={tasksInGroups.normal}
                              emptyText={"You have no normal tasks"}
                              onItemClick={handleOpen}
                           />
                        ),
                     },
                  ]}
               />
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
               disabled={task.id !== props.enabledTaskId || props.hasOngoingTask}
               disabledTooltipText={
                  task.id !== props.enabledTaskId
                     ? "You have an older/more important task to complete. Please finish that first."
                     : props.hasOngoingTask
                       ? "You have an ongoing task. Please finish that first."
                       : ""
               }
               key={task.id}
               priority={task.priority}
               extra={
                  <Typography.Text className="text-gray-500">
                     {extended_dayjs(task.createdAt).fromNow(false)}
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
