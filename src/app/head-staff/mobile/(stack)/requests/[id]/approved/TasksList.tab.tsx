"use client"

import TaskCardBasic from "@/common/components/TaskCardBasic"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import { useMutation, UseQueryResult } from "@tanstack/react-query"
import { Alert, App, Badge, Card, Collapse, ConfigProvider, Divider, Empty, Segmented, Tabs, Tag } from "antd"
import { Fragment, useMemo, useRef, useState } from "react"
import TaskDetailsDrawer, { TaskDetailsDrawerRefType } from "./TaskDetails.drawer"
import HeadStaff_Task_Create from "@/app/head-staff/_api/task/create.api"
import { ReceiveWarrantyTypeErrorId } from "@/constants/Warranty"
import { generateTaskName } from "./CreateTask.drawer"
import dayjs from "dayjs"
import HeadStaff_Task_Update from "@/app/head-staff/_api/task/update.api"
import { cn } from "@/common/util/cn.util"
import {
   CalendarBlank,
   Dot,
   HourglassMedium,
   Package,
   Prohibit,
   ShieldWarning,
   UserCheck,
   UserCircleDashed,
} from "@phosphor-icons/react"

type Props = {
   api_request: UseQueryResult<FixRequestDto, Error>
   className?: string
   highlightTaskId?: Set<String>
}

export default function TasksListTab(props: Props) {
   const taskDetailsRef = useRef<TaskDetailsDrawerRefType | null>(null)
   const { message } = App.useApp()

   const [tab, setTab] = useState<string>("1")

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

   const mutate_createTask = useMutation({
      mutationFn: HeadStaff_Task_Create,
   })

   const mutate_updateTaskStatus = useMutation({
      mutationFn: HeadStaff_Task_Update,
   })

   const taskGrouped = useMemo(() => {
      let result = {
         completed: [],
         headstaffConfirm: [],
         awaitFixer: [],
         awaitSparePart: [],
         cancelled: [],
         assigned: [],
         inProgress: [],
      } as {
         completed: TaskDto[]
         headstaffConfirm: TaskDto[]
         awaitFixer: TaskDto[]
         awaitSparePart: TaskDto[]
         cancelled: TaskDto[]
         assigned: TaskDto[]
         inProgress: TaskDto[]
      }
      taskSorted.forEach((task) => {
         if (task.status === TaskStatus.COMPLETED) {
            result.completed.push(task)
         } else if (task.status === TaskStatus.HEAD_STAFF_CONFIRM) {
            result.headstaffConfirm.push(task)
         } else if (task.status === TaskStatus.AWAITING_FIXER) {
            result.awaitFixer.push(task)
         } else if (task.status === TaskStatus.AWAITING_SPARE_SPART) {
            result.awaitSparePart.push(task)
         } else if (task.status === TaskStatus.CANCELLED) {
            result.cancelled.push(task)
         } else if (task.status === TaskStatus.ASSIGNED) {
            result.assigned.push(task)
         } else {
            result.inProgress.push(task)
         }
      })

      return result
   }, [taskSorted])

   async function handleAutoCreateWarrantyTask(returnDate?: string) {
      try {
         console.log("Test")
         if (!props.api_request.isSuccess) {
            console.log("Failed 1")
            return
         }
         const issue = props.api_request.data.issues.find((issue) => issue.typeError.id === ReceiveWarrantyTypeErrorId)
         if (!issue) {
            console.log("Failed 2")
            return
         }
         console.log("Reacted herer")

         // check if already has warranty task
         if (issue.task !== null) {
            console.log("Failed 3")
            return
         }

         const task = await mutate_createTask.mutateAsync({
            issueIDs: [issue.id],
            name: `${dayjs(props.api_request.data.createdAt).add(7, "hours").format("DDMMYY")}_${props.api_request.data.device.area.name}_${props.api_request.data.device.machineModel.name}_Lắp máy bảo hành`,
            operator: 0,
            priority: false,
            request: props.api_request.data.id,
            totalTime: issue.typeError.duration,
            fixerDate: returnDate ?? props.api_request.data.return_date_warranty ?? undefined,
         })

         console.log("stuff")

         const taskUpdate = await mutate_updateTaskStatus.mutateAsync({
            id: task.id,
            payload: {
               status: TaskStatus.AWAITING_FIXER,
            },
         })

         props.api_request.refetch()
      } catch (error) {
         console.error(error)
         message.error("Có lỗi xảy ra khi tạo tác vụ bảo hành, vui lòng thử lại")
      }
   }

   function getCount(...ints: number[]) {
      const total = ints.reduce((acc, cur) => acc + cur, 0)
      if (total === 0) return ""
      if (total > 99) return "(99+)"
      return `(${total.toString()})`
   }

   return (
      <section className={cn("flex-1", props.className)}>
         <ConfigProvider
            theme={{
               components: {
                  Tabs: {
                     inkBarColor: "#a3a3a3",
                     itemActiveColor: "#737373",
                     itemSelectedColor: "#737373",
                     itemColor: "#a3a3a3",
                     titleFontSize: 14,
                  },
               },
            }}
         >
            <Tabs
               activeKey={tab}
               onChange={setTab}
               className="test-tabs"
               items={[
                  {
                     key: "1",
                     label: (
                        <div className="py-1">
                           Chưa xử lý{" "}
                           {getCount(
                              taskGrouped.awaitFixer.length,
                              taskGrouped.awaitSparePart.length,
                              taskGrouped.assigned.length,
                           )}
                        </div>
                     ),
                  },
                  {
                     key: "2",
                     label: (
                        <div className="py-1">
                           Đang thực hiện {getCount(taskGrouped.inProgress.length, taskGrouped.headstaffConfirm.length)}
                        </div>
                     ),
                  },
                  { key: "3", label: <div className="py-1">Hoàn thành {getCount(taskGrouped.completed.length)}</div> },
               ]}
            />
         </ConfigProvider>
         {tab === "1" && (
            <div className="grid grid-cols-1 px-layout">
               {taskGrouped.awaitFixer.length === 0 &&
                  taskGrouped.assigned.length === 0 &&
                  taskGrouped.awaitSparePart.length === 0 && (
                     <div className="grid place-items-center py-12">
                        <Empty description="Không có tác vụ" />
                     </div>
                  )}
               {[...taskGrouped.awaitFixer, ...taskGrouped.assigned, ...taskGrouped.awaitSparePart].map(
                  (task, index, array) => (
                     <Fragment key={task.id}>
                        {index !== 0 && (
                           <div className="grid grid-cols-[24px_1fr] gap-4">
                              {(array[index - 1] === undefined || array[index - 1]?.status === task.status) && (
                                 <div></div>
                              )}
                              <Divider
                                 className={cn(
                                    "my-3",
                                    array[index - 1] !== undefined &&
                                       array[index - 1]?.status !== task.status &&
                                       "col-span-2",
                                 )}
                              />
                           </div>
                        )}
                        <div
                           className="grid cursor-pointer grid-cols-[24px_1fr] gap-4"
                           onClick={() => taskDetailsRef.current?.handleOpen(task)}
                        >
                           <div className="grid place-items-center">
                              {task.status === TaskStatus.AWAITING_FIXER && (
                                 <UserCircleDashed
                                    size={24}
                                    weight="fill"
                                    className={TaskStatusTagMapper[task.status].className ?? "text-lime-600"}
                                 />
                              )}
                              {task.status === TaskStatus.AWAITING_SPARE_SPART && (
                                 <Package
                                    size={24}
                                    weight="fill"
                                    className={TaskStatusTagMapper[task.status].className}
                                 />
                              )}
                              {task.status === TaskStatus.ASSIGNED && (
                                 <UserCheck
                                    size={24}
                                    weight="fill"
                                    className={TaskStatusTagMapper[task.status].className}
                                 />
                              )}
                           </div>
                           <div className="flex flex-col gap-0.5">
                              <h3 className="text-sm text-neutral-800">{task.name}</h3>
                              <div className="flex items-center">
                                 <div className={cn(TaskStatusTagMapper[task.status].className)}>
                                    {TaskStatusTagMapper[task.status].text}
                                 </div>
                                 {task.fixerDate && (
                                    <>
                                       <Dot size={24} className="text-neutral-500" />
                                       <div className="flex items-center">
                                          <CalendarBlank size={16} className="mr-1 inline" />
                                          <span className="text-sm">{dayjs(task.fixerDate).format("DD/MM")}</span>
                                       </div>
                                    </>
                                 )}
                              </div>
                           </div>
                        </div>
                     </Fragment>
                  ),
               )}
            </div>
         )}
         {tab === "2" && (
            <div className="grid grid-cols-1 px-layout">
               {taskGrouped.headstaffConfirm.length === 0 &&
                  taskGrouped.inProgress.length === 0 &&
                  taskGrouped.cancelled.length === 0 && (
                     <div className="grid place-items-center py-12">
                        <Empty description="Không có tác vụ" />
                     </div>
                  )}
               {[...taskGrouped.headstaffConfirm, ...taskGrouped.inProgress, ...taskGrouped.cancelled].map(
                  (task, index, array) => (
                     <Fragment key={task.id}>
                        {index !== 0 && (
                           <div className="grid grid-cols-[24px_1fr] gap-4">
                              {(array[index - 1] === undefined || array[index - 1]?.status === task.status) && (
                                 <div></div>
                              )}
                              <Divider
                                 className={cn(
                                    "my-3",
                                    array[index - 1] !== undefined &&
                                       array[index - 1]?.status !== task.status &&
                                       "col-span-2",
                                 )}
                              />
                           </div>
                        )}
                        <div
                           className="grid cursor-pointer grid-cols-[24px_1fr] gap-4"
                           onClick={() => taskDetailsRef.current?.handleOpen(task)}
                        >
                           <div className="grid place-items-center">
                              {task.status === TaskStatus.HEAD_STAFF_CONFIRM && (
                                 <ShieldWarning
                                    size={24}
                                    weight="fill"
                                    className={TaskStatusTagMapper[task.status].className}
                                 />
                              )}
                              {task.status === TaskStatus.IN_PROGRESS && (
                                 <HourglassMedium
                                    size={24}
                                    weight="fill"
                                    className={TaskStatusTagMapper[task.status].className}
                                 />
                              )}
                              {task.status === TaskStatus.CANCELLED && (
                                 <Prohibit
                                    size={24}
                                    weight="fill"
                                    className={TaskStatusTagMapper[task.status].className}
                                 />
                              )}
                           </div>
                           <div className="flex flex-col gap-0.5">
                              <h3 className="text-sm text-neutral-800">{task.name}</h3>
                              <div className="flex items-center">
                                 <div className={cn(TaskStatusTagMapper[task.status].className)}>
                                    {TaskStatusTagMapper[task.status].text}
                                 </div>
                                 {task.fixerDate && (
                                    <>
                                       <Dot size={24} className="text-neutral-500" />
                                       <div className="flex items-center">
                                          <CalendarBlank size={16} className="mr-1 inline" />
                                          <span className="text-sm">{dayjs(task.fixerDate).format("DD/MM")}</span>
                                       </div>
                                    </>
                                 )}
                              </div>
                           </div>
                        </div>
                     </Fragment>
                  ),
               )}
            </div>
         )}
         {tab === "3" && <div>Test</div>}
         <TaskDetailsDrawer
            ref={taskDetailsRef}
            refetchFn={async () => {
               await props.api_request.refetch()
            }}
            autoCreateTaskFn={handleAutoCreateWarrantyTask}
         />
      </section>
   )
}
