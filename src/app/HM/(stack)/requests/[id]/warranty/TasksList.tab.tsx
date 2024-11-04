"use client"

import HeadStaff_Task_Create from "@/features/head-maintenance/api/task/create.api"
import HeadStaff_Task_Update from "@/features/head-maintenance/api/task/update.api"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import {
   AssembleDeviceTypeErrorId,
   DisassembleDeviceTypeErrorId,
   ReceiveWarrantyTypeErrorId,
   SendWarrantyTypeErrorId,
} from "@/lib/constants/Warranty"
import { Calendar, User } from "@phosphor-icons/react"
import { useMutation, UseQueryResult } from "@tanstack/react-query"
import { App, ConfigProvider, Divider, Space, Steps } from "antd"
import dayjs from "dayjs"
import { useMemo, useRef } from "react"
import Button from "antd/es/button"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import Task_ViewDetailsDrawerWarranty, {
   Task_ViewDetailsDrawerWarrantyRefType,
} from "@/features/head-maintenance/components/overlays/Task_ViewDetails_Warranty.drawer"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { RightOutlined } from "@ant-design/icons"

type Props = {
   api_request: UseQueryResult<RequestDto, Error>
   className?: string
   highlightTaskId?: Set<String>
   handleOpenCreateTask?: () => void
   disabledCreateTask?: boolean

   onSuccess_FinishRequest?: () => void
}

export default function TasksListTab(props: Props) {
   const taskDetailsRef = useRef<Task_ViewDetailsDrawerWarrantyRefType | null>(null)
   const { message, modal } = App.useApp()

   const mutate_finishRequest = head_maintenance_mutations.request.finish()

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

   const sendWarrantyTask = useMemo(() => {
      if (!props.api_request.isSuccess) return

      return props.api_request.data.tasks.find((t) =>
         t.issues.find(
            (i) => i.typeError.id === SendWarrantyTypeErrorId || i.typeError.id === DisassembleDeviceTypeErrorId,
         ),
      )
   }, [props.api_request.data?.tasks, props.api_request.isSuccess])

   const receiveWarrantyTask = useMemo(() => {
      if (!props.api_request.isSuccess) return

      return props.api_request.data.tasks.find((t) =>
         t.issues.find(
            (i) => i.typeError.id === ReceiveWarrantyTypeErrorId || i.typeError.id === AssembleDeviceTypeErrorId,
         ),
      )
   }, [props.api_request.data?.tasks, props.api_request.isSuccess])

   function handleFinishRequest(requestId: string) {
      modal.confirm({
         title: "Đóng yêu cầu",
         content: "Bạn có chắc chắn muốn đóng yêu cầu này?",
         onOk: () => {
            mutate_finishRequest.mutate(
               { id: requestId },
               {
                  onSettled: () => props.api_request.refetch(),
                  onSuccess: props.onSuccess_FinishRequest,
               },
            )
         },
         cancelText: "Hủy",
         okText: "Hoàn tất",
         closable: true,
         centered: true,
         maskClosable: true,
      })
   }

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
      <section className={cn("flex-1 pb-[100px]", props.className)}>
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
            {props.api_request.isSuccess && (
               <div className={"p-layout"}>
                  {sendWarrantyTask && receiveWarrantyTask && (
                     <Steps
                        current={(function () {
                           if (sendWarrantyTask.status === TaskStatus.COMPLETED) return 1
                           return 0
                        })()}
                        items={[
                           {
                              title: (
                                 <div className={"flex items-center justify-between"}>
                                    <div className={"text-base font-bold"}>Gửi máy đi bảo hành</div>
                                    <RightOutlined />
                                 </div>
                              ),
                              onClick: () => {
                                 props.api_request.isSuccess &&
                                    taskDetailsRef.current?.handleOpen(sendWarrantyTask, props.api_request.data?.id)
                              },
                              status: (function () {
                                 if (sendWarrantyTask?.status === TaskStatus.IN_PROGRESS) return "process"
                                 if (sendWarrantyTask?.status === TaskStatus.COMPLETED) return "finish"
                                 return "wait"
                              })(),
                              description: (
                                 <div className={"flex flex-col text-xs"}>
                                    <span>Tháo gỡ và gửi máy đến trung tâm bảo hành</span>
                                    <Space split={<Divider type={"vertical"} className={"m-0"} />} className={"mt-2"}>
                                       <div
                                          className={cn(
                                             "flex items-center gap-1",
                                             TaskStatusTagMapper[sendWarrantyTask.status].className,
                                          )}
                                       >
                                          {TaskStatusTagMapper[sendWarrantyTask.status].icon}
                                          {TaskStatusTagMapper[sendWarrantyTask.status].text}
                                       </div>
                                       {sendWarrantyTask.fixer && (
                                          <div className={cn("flex items-center gap-1")}>
                                             <User size={16} weight={"duotone"} />
                                             {sendWarrantyTask.fixer.username}
                                          </div>
                                       )}
                                       {sendWarrantyTask.fixerDate && (
                                          <div className={cn("flex items-center gap-1")}>
                                             <Calendar size={16} weight={"duotone"} />
                                             {dayjs(sendWarrantyTask.fixerDate).format("DD/MM/YYYY")}
                                          </div>
                                       )}
                                    </Space>
                                 </div>
                              ),
                           },
                           {
                              disabled: sendWarrantyTask.status !== TaskStatus.COMPLETED,
                              className: cn(sendWarrantyTask.status !== TaskStatus.COMPLETED && "opacity-30"),
                              title: (
                                 <div className={"flex items-center justify-between"}>
                                    <div className={"text-base font-bold"}>Đem mày về và lắp đặt</div>
                                    <RightOutlined />
                                 </div>
                              ),
                              onClick: () => {
                                 props.api_request.isSuccess &&
                                    taskDetailsRef.current?.handleOpen(
                                       receiveWarrantyTask,
                                       props.api_request.data?.id,
                                       sendWarrantyTask.status !== TaskStatus.COMPLETED,
                                    )
                              },
                              status: (function () {
                                 if (receiveWarrantyTask?.status === TaskStatus.IN_PROGRESS) return "process"
                                 if (receiveWarrantyTask?.status === TaskStatus.COMPLETED) return "finish"
                                 return "wait"
                              })(),
                              description: (
                                 <div className={"flex flex-col text-xs"}>
                                    <span>Lấy máy từ trung tâm bảo hành và lắp đặt tại xưởng</span>
                                    <Space split={<Divider type={"vertical"} className={"m-0"} />} className={"mt-2"}>
                                       <div
                                          className={cn(
                                             "flex items-center gap-1",
                                             TaskStatusTagMapper[receiveWarrantyTask.status].className,
                                          )}
                                       >
                                          {TaskStatusTagMapper[receiveWarrantyTask.status].icon}
                                          {TaskStatusTagMapper[receiveWarrantyTask.status].text}
                                       </div>
                                       {receiveWarrantyTask.fixer && (
                                          <div className={cn("flex items-center gap-1")}>
                                             <User size={16} weight={"duotone"} />
                                             {receiveWarrantyTask.fixer.username}
                                          </div>
                                       )}
                                       {receiveWarrantyTask.fixerDate && (
                                          <div className={cn("flex items-center gap-1")}>
                                             <Calendar size={16} weight={"duotone"} />
                                             {dayjs(receiveWarrantyTask.fixerDate).format("DD/MM/YYYY")}
                                          </div>
                                       )}
                                    </Space>
                                 </div>
                              ),
                           },
                        ]}
                     />
                  )}
                  {props.api_request.data.status === FixRequestStatus.IN_PROGRESS &&
                     props.api_request.data.issues.every(
                        (t) => t.status === IssueStatusEnum.RESOLVED || t.status === IssueStatusEnum.CANCELLED,
                     ) && (
                        <section className={"fixed bottom-0 left-0 z-50 w-full bg-white p-layout"}>
                           <Button
                              block
                              type={"primary"}
                              size={"large"}
                              onClick={() => {
                                 props.api_request.isSuccess && handleFinishRequest(props.api_request.data.id)
                              }}
                           >
                              Đóng yêu cầu
                           </Button>
                        </section>
                     )}
               </div>
            )}
         </ConfigProvider>
         <Task_ViewDetailsDrawerWarranty
            ref={taskDetailsRef}
            refetchFn={async () => {
               await props.api_request.refetch()
            }}
            autoCreateTaskFn={handleAutoCreateWarrantyTask}
         />
      </section>
   )
}
