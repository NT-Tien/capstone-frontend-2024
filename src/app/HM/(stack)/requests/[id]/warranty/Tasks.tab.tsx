"use client"

import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Task_AssignFixerV2Drawer, {
    Task_AssignFixerModalProps,
} from "@/features/head-maintenance/components/overlays/Task_AssignFixerV2.drawer"
import Issue_ViewDetails_WarrantyDrawer, {
    Issue_ViewDetails_WarrantyDrawerProps,
} from "@/features/head-maintenance/components/overlays/warranty/Issue_ViewDetails_Warranty.drawer"
import Task_VerifyComplete_WarrantyDrawer, {
    Task_VerifyComplete_WarrantyDrawerProps,
} from "@/features/head-maintenance/components/overlays/warranty/Task_VerifyComplete_Warranty.drawer"
import TaskCard from "@/features/head-maintenance/components/TaskCard"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import {
    AssembleDeviceTypeErrorId,
    DisassembleDeviceTypeErrorId,
    ReceiveWarrantyTypeErrorId,
    SendWarrantyTypeErrorId,
} from "@/lib/constants/Warranty"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import useScanQrCodeDrawer from "@/lib/hooks/useScanQrCodeDrawer"
import { cn } from "@/lib/utils/cn.util"
import {
    PlusOutlined
} from "@ant-design/icons"
import { CheckSquare } from "@phosphor-icons/react"
import { UseQueryResult } from "@tanstack/react-query"
import { App } from "antd"
import Button from "antd/es/button"
import dayjs from "dayjs"
import { useMemo, useRef } from "react"

type Props = {
   api_request: UseQueryResult<RequestDto, Error>
   className?: string
   highlightTaskId?: Set<String>
   handleOpenCreateTask?: () => void
   disabledCreateTask?: boolean

   onSuccess_FinishRequest?: () => void
}

function TasksTab(props: Props) {
   const { modal, message } = App.useApp()

   const control_issueViewDetailsWarrantyDrawer = useRef<RefType<Issue_ViewDetails_WarrantyDrawerProps>>(null),
      control_taskAssignFixerDrawer = useRef<RefType<Task_AssignFixerModalProps>>(null),
      control_taskVerifyComplete_warrantyDrawer = useRef<RefType<Task_VerifyComplete_WarrantyDrawerProps>>(null),
      control_createReturnWarrantyTask = useRef<RefType<Task_AssignFixerModalProps>>(null),
      control_qrScanner = useScanQrCodeDrawer({
         validationFn: async (data) => {
            if (!props.api_request.isSuccess) throw new Error("Request not found")

            if (data !== props.api_request.data.device.id) {
               return false
            }

            return true
         },
         onError(error) {
            if (error instanceof Error && error.message === "Request not found") {
               message.error("Đã xảy ra lỗi, vui lòng thử lại sau")
               return
            }

            console.error(error)
            message.error("Đã xảy ra lỗi, vui lòng thử lại sau")
         },
         infoText: "Quét mã QR trên thiết bị để xác nhận",
         onSuccess() {
            setTimeout(() => {
               control_taskVerifyComplete_warrantyDrawer.current?.handleOpen({
                  task: receiveWarrantyTask,
                  request: props.api_request.data,
               })
            }, 150)
         },
      })

   const mutate_finishRequest = head_maintenance_mutations.request.finish(),
      mutate_updateTask = head_maintenance_mutations.task.update(),
      mutate_createReturnWarranty = head_maintenance_mutations.request.createReturnWarranty()

   const sendWarrantyTask = useMemo(() => {
      if (!props.api_request.isSuccess) return

      return props.api_request.data.tasks
         .filter((t) =>
            t.issues.find(
               (i) => i.typeError.id === SendWarrantyTypeErrorId || i.typeError.id === DisassembleDeviceTypeErrorId,
            ),
         )
         .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))[0]
   }, [props.api_request.data?.tasks, props.api_request.isSuccess])

   const receiveWarrantyTask = useMemo(() => {
      if (!props.api_request.isSuccess) return

      return props.api_request.data.tasks
         .filter((t) =>
            t.issues.find(
               (i) => i.typeError.id === ReceiveWarrantyTypeErrorId || i.typeError.id === AssembleDeviceTypeErrorId,
            ),
         )
         .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))[0]
   }, [props.api_request.data?.tasks, props.api_request.isSuccess])

   const warrantyIssues = useMemo(() => {
      const disassemble = TaskUtil.getTask_Warranty_FirstIssue(sendWarrantyTask)
      const send = TaskUtil.getTask_Warranty_SecondIssue(sendWarrantyTask)
      const receive = TaskUtil.getTask_Warranty_FirstIssue(receiveWarrantyTask)
      const assemble = TaskUtil.getTask_Warranty_SecondIssue(receiveWarrantyTask)

      return {
         disassemble,
         send,
         receive,
         assemble,
      }
   }, [receiveWarrantyTask, sendWarrantyTask])

   const isSendCompleted = useMemo(() => {
      return (
         sendWarrantyTask?.status === TaskStatus.COMPLETED &&
         sendWarrantyTask?.issues.every((i) => i.status === IssueStatusEnum.RESOLVED)
      )
   }, [sendWarrantyTask?.issues, sendWarrantyTask?.status])

   const warrantyStatus = useMemo(() => {
      if (warrantyIssues.disassemble?.status !== IssueStatusEnum.RESOLVED) return "Chưa gửi"
      if (warrantyIssues.send?.status === IssueStatusEnum.PENDING) return "Đang gửi"
      if (
         warrantyIssues.send?.status === IssueStatusEnum.RESOLVED &&
         warrantyIssues.receive?.status !== IssueStatusEnum.RESOLVED
      )
         return "Đang bảo hành"
      if (
         warrantyIssues.send?.status === IssueStatusEnum.FAILED ||
         warrantyIssues.receive?.status === IssueStatusEnum.FAILED
      )
         return "Từ chối bảo hành"

      if (warrantyIssues.receive?.status === IssueStatusEnum.RESOLVED) return "Bảo hành thành công"
   }, [warrantyIssues])

   function handleFinishRequest(requestId: string) {
      modal.confirm({
         title: "Hoàn tất yêu cầu",
         content: "Bạn có chắc chắn muốn Hoàn tất yêu cầu này?",
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

   return (
      <section className={cn("relative flex-1 pb-[80px]", props.className)}>
         {props.api_request.isSuccess && (
            <div className={"p-layout"}>
               <section>
                  <header className="mb-2">
                     <h3 className="flex items-center text-base font-bold">
                        <CheckSquare size={20} weight="fill" className="mr-1 flex-shrink-0 text-red-800" />
                        <p className="mr-2 whitespace-nowrap">Danh sách tác vụ</p>
                        <div className="m-2 h-0.5 w-full rounded-full bg-red-800" />
                        <div>{props.api_request.data.tasks.length}</div>
                     </h3>
                  </header>
                  <ul className="flex flex-col gap-2">
                     {/* Task list is here */}
                     {props.api_request.data.tasks.sort((a, b) => {
                        const statusOrder: {
                           [key: string]: number
                        } = {
                           [TaskStatus.IN_PROGRESS]: 1,
                           [TaskStatus.AWAITING_FIXER]: 2,
                           [TaskStatus.HEAD_STAFF_CONFIRM]: 2,
                           [TaskStatus.COMPLETED]: 3,
                           [TaskStatus.CANCELLED]: 4,
                         }
                     
                         return (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0)
                     }).map((task) => {
                        if (!props.api_request.isSuccess) return

                        if (TaskUtil.isTask_Warranty(task, "send")) {
                           return (
                              <TaskCard.Warranty
                                 key={task.id}
                                 task={task}
                                 handleOpen_assignFixer={(props) =>
                                    control_taskAssignFixerDrawer.current?.handleOpen(props)
                                 }
                                 handleOpen_issueViewDetailsWarranty={(props) =>
                                    control_issueViewDetailsWarrantyDrawer.current?.handleOpen(props)
                                 }
                                 requestId={props.api_request.data.id}
                                 title={TaskCard.Warranty.SendTitle}
                              />
                           )
                        }

                        if (TaskUtil.isTask_Warranty(task, "receive")) {
                           return (
                              <TaskCard.Warranty
                                 key={task.id}
                                 task={task}
                                 handleOpen_assignFixer={(props) =>
                                    control_taskAssignFixerDrawer.current?.handleOpen(props)
                                 }
                                 handleOpen_issueViewDetailsWarranty={(props) =>
                                    control_issueViewDetailsWarrantyDrawer.current?.handleOpen(props)
                                 }
                                 requestId={props.api_request.data.id}
                                 title={TaskCard.Warranty.ReceiveTitle}
                              />
                           )
                        }

                        if (TaskUtil.isTask_Warranty(task, "install-replacement")) {
                           return (
                              <TaskCard.Warranty_Replacement
                                 key={task.id}
                                 task={task}
                                 handleOpen_assignFixer={(props) =>
                                    control_taskAssignFixerDrawer.current?.handleOpen(props)
                                 }
                                 handleOpen_issueViewDetailsWarranty={(props) =>
                                    control_issueViewDetailsWarrantyDrawer.current?.handleOpen(props)
                                 }
                                 title={TaskCard.Warranty_Replacement.InstallTitle}
                                 requestId={props.api_request.data.id}
                              />
                           )
                        }

                        return <div key={task.id}>Task {task.name}</div>
                     })}
                  </ul>
               </section>
               {props.api_request.data.status === FixRequestStatus.IN_PROGRESS &&
                  props.api_request.data.tasks.every(
                     (t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.CANCELLED,
                  ) &&
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
                           Hoàn tất yêu cầu
                        </Button>
                     </section>
                  )}
            </div>
         )}
         {control_qrScanner.contextHolder()}
         <OverlayControllerWithRef ref={control_issueViewDetailsWarrantyDrawer}>
            <Issue_ViewDetails_WarrantyDrawer refetchFn={() => props.api_request.refetch()} />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_createReturnWarrantyTask}>
            <Task_AssignFixerV2Drawer
               onSubmit={(fixer, date, priority) => {
                  if (!props.api_request.isSuccess) return
                  mutate_createReturnWarranty.mutate(
                     {
                        id: props.api_request.data.id,
                        payload: {
                           fixer: fixer.id,
                           fixerDate: date.toISOString(),
                           priority,
                        },
                     },
                     {
                        onSettled: () => props.api_request.refetch(),
                     },
                  )
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_taskAssignFixerDrawer}>
            <Task_AssignFixerV2Drawer
               onSubmit={(fixer, date, priority, taskId) => {
                  if (!taskId) {
                     console.error("Dev error: Missing task ID")
                     return
                  }
                  mutate_updateTask.mutate(
                     {
                        id: taskId,
                        payload: {
                           fixer: fixer.id,
                           fixerDate: date.toISOString(),
                           priority,
                           status: TaskStatus.ASSIGNED,
                        },
                     },
                     {
                        onSettled: () => props.api_request.refetch(),
                     },
                  )
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_taskVerifyComplete_warrantyDrawer}>
            <Task_VerifyComplete_WarrantyDrawer onSubmit={() => props.api_request.refetch()} />
         </OverlayControllerWithRef>
         <footer>
            
         </footer>
      </section>
   )
}

export default TasksTab
