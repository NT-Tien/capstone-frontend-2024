"use client"

import TaskCardBasic from "@/common/components/TaskCardBasic"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import { UseQueryResult } from "@tanstack/react-query"
import { Card, Collapse, Empty } from "antd"
import { useMemo, useRef } from "react"
import TaskDetailsDrawer, { TaskDetailsDrawerRefType } from "./TaskDetails.drawer"

type Props = {
   api_request: UseQueryResult<FixRequestDto, Error>
   className?: string
}

export default function TasksList(props: Props) {
   const taskDetailsRef = useRef<TaskDetailsDrawerRefType | null>(null)

   const taskSorted = useMemo(() => {
      if (!props.api_request.data) return []
      // sort by status completed -> priority -> task name
      return props.api_request.data.tasks.sort((a, b) => {
         if (a.status === b.status) {
            if (a.priority === b.priority) {
               return a.name.localeCompare(b.name)
            }
            return a.priority ? -1 : 1
         }
         return a.status === TaskStatus.COMPLETED ? -1 : 1
      })
   }, [props.api_request.data])

   const taskGrouped = useMemo(() => {
      let result = {
         completed: [],
         headstaffConfirm: [],
         awaitFixer: [],
         remaining: [],
      } as {
         completed: TaskDto[]
         headstaffConfirm: TaskDto[]
         awaitFixer: TaskDto[]
         remaining: TaskDto[]
      }
      taskSorted.forEach((task) => {
         if (task.status === TaskStatus.COMPLETED) {
            result.completed.push(task)
         } else if (task.status === TaskStatus.HEAD_STAFF_CONFIRM) {
            result.headstaffConfirm.push(task)
         } else if (task.status === TaskStatus.AWAITING_FIXER) {
            result.awaitFixer.push(task)
         } else {
            result.remaining.push(task)
         }
      })

      return result
   }, [taskSorted])

   return (
      <section className={props.className}>
         {taskSorted.length === 0 && (
            <Card size="small">
               <Empty description="Không có tác vụ" />
            </Card>
         )}
         <Collapse
            ghost
            defaultActiveKey={["headstaffconfirm", "awaitfixer", "remaining"]}
            className="p-0 custom-collapse-padding"
            items={[
               ...(taskGrouped.headstaffConfirm.length > 0
                  ? [
                       {
                          key: "headstaffconfirm",
                          label: TaskStatusTagMapper[TaskStatus.HEAD_STAFF_CONFIRM].text + ` (${taskGrouped.headstaffConfirm.length})`,
                          children: (
                             <div className="grid grid-cols-1 gap-2">
                                {taskGrouped.headstaffConfirm.map((task) => (
                                   <TaskCardBasic
                                      key={task.id}
                                      task={task}
                                      onClick={() => taskDetailsRef.current?.handleOpen(task)}
                                   />
                                ))}
                             </div>
                          ),
                       },
                    ]
                  : []),
               ...(taskGrouped.awaitFixer.length > 0
                  ? [
                       {
                          key: "awaitfixer",
                          label: TaskStatusTagMapper[TaskStatus.AWAITING_FIXER].text + ` (${taskGrouped.awaitFixer.length})`,
                          children: (
                             <div className="grid grid-cols-1 gap-2">
                                {taskGrouped.awaitFixer.map((task) => (
                                   <TaskCardBasic
                                      key={task.id}
                                      task={task}
                                      onClick={() => taskDetailsRef.current?.handleOpen(task)}
                                   />
                                ))}
                             </div>
                          ),
                       },
                    ]
                  : []),
               {
                  key: "doing",
                  label: "Chưa/Đang thực hiện" + ` (${taskGrouped.remaining.length})`,
                  children: (
                     <div className="grid grid-cols-1 gap-2">
                        {taskGrouped.remaining.map((task) => (
                           <TaskCardBasic
                              key={task.id}
                              task={task}
                              onClick={() => taskDetailsRef.current?.handleOpen(task)}
                           />
                        ))}
                     </div>
                  ),
               },
               ...(taskGrouped.completed.length > 0
                  ? [
                       {
                          key: "remaining",
                          label: TaskStatusTagMapper[TaskStatus.COMPLETED].text + ` (${taskGrouped.completed.length})`,
                          children: (
                             <div className="grid grid-cols-1 gap-2">
                                {taskGrouped.completed.map((task) => (
                                   <TaskCardBasic
                                      key={task.id}
                                      task={task}
                                      onClick={() => taskDetailsRef.current?.handleOpen(task)}
                                   />
                                ))}
                             </div>
                          ),
                       },
                    ]
                  : []),
            ]}
         />
         {/* <div className="grid grid-cols-1 gap-2">
            {taskGrouped.remaining.map((task) => (
               <TaskCardBasic
                  key={task.id}
                  task={task}
                  onClick={() => router.push(`/head-staff/mobile/tasks/${task.id}?goto=request`)}
               />
            ))}
         </div> */}
         <TaskDetailsDrawer ref={taskDetailsRef} refetchFn={props.api_request.refetch} />
      </section>
   )
}
