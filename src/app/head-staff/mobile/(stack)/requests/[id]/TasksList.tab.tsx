"use client"

import { UseQueryResult } from "@tanstack/react-query"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { useRouter } from "next/navigation"
import TaskCardBasic from "@/common/components/TaskCardBasic"
import { useMemo } from "react"
import { TaskStatus } from "@/common/enum/task-status.enum"

type Props = {
   api: UseQueryResult<FixRequestDto, Error>
   className?: string
}

export default function TasksList(props: Props) {
   const router = useRouter()

   const taskGroups = useMemo(() => {
      if (!props.api.data) return []
      // sort by status completed -> priority -> task name
      return props.api.data.tasks.sort((a, b) => {
         if (a.status === b.status) {
            if (a.priority === b.priority) {
               return a.name.localeCompare(b.name)
            }
            return a.priority ? -1 : 1
         }
         return a.status === TaskStatus.COMPLETED ? -1 : 1
      })
   }, [props.api.data])

   return (
      <section className={props.className}>
         <h2>Yêu cầu có {props.api.data?.tasks.length} tác vụ</h2>
         <div className="grid grid-cols-1 gap-2">
            {taskGroups.map((task) => (
               <TaskCardBasic
                  key={task.id}
                  task={task}
                  onClick={() => router.push(`/head-staff/mobile/tasks/${task.id}`)}
               />
            ))}
         </div>
      </section>
   )
}
