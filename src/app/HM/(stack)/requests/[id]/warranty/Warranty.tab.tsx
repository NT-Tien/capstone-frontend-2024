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
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import useScanQrCodeDrawer from "@/lib/hooks/useScanQrCodeDrawer"
import { cn } from "@/lib/utils/cn.util"
import { EditOutlined, LeftCircleFilled, MoreOutlined, RightOutlined, UserOutlined } from "@ant-design/icons"
import { Calendar, User } from "@phosphor-icons/react"
import { UseQueryResult } from "@tanstack/react-query"
import { App, ConfigProvider, Divider, Dropdown, Space, Steps } from "antd"
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

function WarrantyTab(props: Props) {
   const control_issueViewDetailsWarrantyDrawer = useRef<RefType<Issue_ViewDetails_WarrantyDrawerProps>>(null)
   const control_taskAssignFixerDrawer = useRef<RefType<Task_AssignFixerModalProps>>(null)
   const control_taskVerifyComplete_warrantyDrawer = useRef<RefType<Task_VerifyComplete_WarrantyDrawerProps>>(null)
   const { modal, message } = App.useApp()

   const control_qrScanner = useScanQrCodeDrawer({
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

   const mutate_finishRequest = head_maintenance_mutations.request.finish()
   const mutate_updateTask = head_maintenance_mutations.task.update()

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

   function handleTaskClick(task?: TaskDto) {
      if (task?.status === TaskStatus.AWAITING_FIXER) {
         control_taskAssignFixerDrawer.current?.handleOpen({
            disabledAssignProps: {
               label: "Chọn nhân viên",
               icon: <UserOutlined />,
               enabledContent: "Tự động",
               disabledContent: "Thủ công",
               defaultEnabled: true,
            },
            taskId: task?.id,
            defaults: {
               date: task?.fixerDate ? new Date(task.fixerDate) : undefined,
               priority: task?.priority ? "priority" : "normal",
               fixer: task?.fixer,
            },
            recommendedFixerIds: [task.fixer?.id],
         })
      }
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
                        size="small"
                        current={(function () {
                           if (
                              sendWarrantyTask.status === TaskStatus.COMPLETED &&
                              sendWarrantyTask.issues.every((i) => i.status === IssueStatusEnum.RESOLVED)
                           )
                              return 1
                           return 0
                        })()}
                        status={(function () {
                           if (sendWarrantyTask.issues.find((i) => i.status === IssueStatusEnum.FAILED)) return "error"
                        })()}
                        className="steps-title-w-full"
                        items={[
                           {
                              title: (
                                 <div className={"flex w-full items-center"}>
                                    <div
                                       className={"flex-grow text-base font-bold"}
                                       onClick={() => handleTaskClick(sendWarrantyTask)}
                                    >
                                       Gửi máy đi bảo hành
                                    </div>
                                    <Dropdown
                                       autoFocus
                                       menu={{
                                          items: [
                                             {
                                                label: "Cập nhật",
                                                icon: <EditOutlined />,
                                                key: "edit-send-warranty",
                                                className: cn(
                                                   "hidden",
                                                   sendWarrantyTask.status === TaskStatus.ASSIGNED && "block",
                                                ),
                                                onClick: () => {
                                                   control_taskAssignFixerDrawer.current?.handleOpen({
                                                      taskId: sendWarrantyTask.id,
                                                      defaults: {
                                                         date: sendWarrantyTask?.fixerDate
                                                            ? new Date(sendWarrantyTask.fixerDate)
                                                            : undefined,
                                                         priority: sendWarrantyTask?.priority ? "priority" : "normal",
                                                         fixer: sendWarrantyTask?.fixer,
                                                      },
                                                      recommendedFixerIds: [sendWarrantyTask.fixer?.id],
                                                   })
                                                },
                                             },
                                          ],
                                       }}
                                    >
                                       <Button
                                          className="translate-x-2"
                                          size="small"
                                          type="text"
                                          icon={<MoreOutlined />}
                                       />
                                    </Dropdown>
                                 </div>
                              ),
                              description: (
                                 <div className={"flex flex-col text-xs"}>
                                    <div className="flex flex-col" onClick={() => handleTaskClick(sendWarrantyTask)}>
                                       <div>Tháo gỡ và gửi máy đến trung tâm bảo hành</div>
                                       <Space
                                          split={<Divider type={"vertical"} className={"m-0"} />}
                                          className={"mt-2 overflow-y-auto"}
                                       >
                                          <div
                                             className={cn(
                                                "flex items-center gap-1 whitespace-pre",
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
                                    <Steps
                                       className="steps-title-w-full mt-4"
                                       progressDot
                                       prefixCls="steps-inner"
                                       status="wait"
                                       size="small"
                                       items={[
                                          {
                                             title: (
                                                <div className="flex justify-between">
                                                   <div className="text-sm font-semibold">
                                                      {warrantyIssues.disassemble?.typeError.name}
                                                   </div>
                                                   <RightOutlined className="text-xs" />
                                                </div>
                                             ),
                                             icon: <LeftCircleFilled />,
                                             description: (
                                                <div className="text-xs">
                                                   {warrantyIssues.disassemble?.typeError.description}
                                                </div>
                                             ),
                                             status: (function () {
                                                switch (warrantyIssues.disassemble?.status) {
                                                   case IssueStatusEnum.RESOLVED:
                                                      return "finish"
                                                   case IssueStatusEnum.FAILED:
                                                   case IssueStatusEnum.CANCELLED:
                                                      return "error"
                                                   default:
                                                      return "wait"
                                                }
                                             })(),
                                             onClick: () =>
                                                control_issueViewDetailsWarrantyDrawer.current?.handleOpen({
                                                   issueId: warrantyIssues.disassemble?.id,
                                                   requestId: props.api_request.data?.id,
                                                }),
                                          },
                                          {
                                             title: (
                                                <div className="flex justify-between">
                                                   <div className="text-sm font-semibold">
                                                      {warrantyIssues.send?.typeError.name}
                                                   </div>
                                                   <RightOutlined className="text-xs" />
                                                </div>
                                             ),
                                             description: (
                                                <div className="text-xs">
                                                   {warrantyIssues.send?.typeError.description}
                                                </div>
                                             ),
                                             status: (function () {
                                                switch (warrantyIssues.send?.status) {
                                                   case IssueStatusEnum.RESOLVED:
                                                      return "finish"
                                                   case IssueStatusEnum.FAILED:
                                                   case IssueStatusEnum.CANCELLED:
                                                      return "error"
                                                   default:
                                                      return "wait"
                                                }
                                             })(),
                                             onClick: () =>
                                                control_issueViewDetailsWarrantyDrawer.current?.handleOpen({
                                                   issueId: warrantyIssues.send?.id,
                                                   requestId: props.api_request.data?.id,
                                                }),
                                          },
                                       ]}
                                    />
                                 </div>
                              ),
                           },
                           {
                              title: (
                                 <div className={"flex w-full items-center"}>
                                    <div
                                       className={"flex-grow text-base font-bold"}
                                       onClick={() => handleTaskClick(receiveWarrantyTask)}
                                    >
                                       Nhận mày và lắp đặt
                                    </div>
                                    <Dropdown
                                       autoFocus
                                       menu={{
                                          items: [
                                             {
                                                label: "Cập nhật",
                                                icon: <EditOutlined />,
                                                key: "edit-receive-warranty",
                                                className: cn(
                                                   "hidden",
                                                   receiveWarrantyTask.status === TaskStatus.ASSIGNED && "block",
                                                ),
                                                onClick: () => {
                                                   control_taskAssignFixerDrawer.current?.handleOpen({
                                                      taskId: receiveWarrantyTask.id,
                                                      defaults: {
                                                         date: receiveWarrantyTask?.fixerDate
                                                            ? new Date(receiveWarrantyTask.fixerDate)
                                                            : undefined,
                                                         priority: receiveWarrantyTask?.priority
                                                            ? "priority"
                                                            : "normal",
                                                         fixer: receiveWarrantyTask?.fixer,
                                                      },
                                                      recommendedFixerIds: [receiveWarrantyTask.fixer?.id],
                                                   })
                                                },
                                             },
                                          ],
                                       }}
                                    >
                                       <Button
                                          className="translate-x-2"
                                          size="small"
                                          type="text"
                                          icon={<MoreOutlined />}
                                       />
                                    </Dropdown>
                                 </div>
                              ),
                              description: (
                                 <div className={"flex flex-col text-xs"}>
                                    <div className="flex flex-col" onClick={() => handleTaskClick(receiveWarrantyTask)}>
                                       <div>Nhận máy từ trung tâm bảo hành và lắp đặt tại xưởng</div>
                                       <Space
                                          split={<Divider type={"vertical"} className={"m-0"} />}
                                          className={"mt-2 overflow-y-auto"}
                                       >
                                          <div
                                             className={cn(
                                                "flex items-center gap-1 whitespace-pre",
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
                                    <Steps
                                       className="steps-title-w-full mt-4"
                                       progressDot
                                       prefixCls="steps-inner"
                                       status="wait"
                                       size="small"
                                       items={[
                                          {
                                             title: (
                                                <div className="flex justify-between">
                                                   <div className="text-sm font-semibold">
                                                      {warrantyIssues.receive?.typeError.name}
                                                   </div>
                                                   <RightOutlined className="text-xs" />
                                                </div>
                                             ),
                                             icon: <LeftCircleFilled />,
                                             description: (
                                                <div className="text-xs">
                                                   {warrantyIssues.receive?.typeError.description}
                                                </div>
                                             ),
                                             status: (function () {
                                                switch (warrantyIssues.receive?.status) {
                                                   case IssueStatusEnum.RESOLVED:
                                                      return "finish"
                                                   case IssueStatusEnum.FAILED:
                                                   case IssueStatusEnum.CANCELLED:
                                                      return "error"
                                                   default:
                                                      return "wait"
                                                }
                                             })(),
                                             onClick: () =>
                                                control_issueViewDetailsWarrantyDrawer.current?.handleOpen({
                                                   issueId: warrantyIssues.receive?.id,
                                                   requestId: props.api_request.data?.id,
                                                }),
                                          },
                                          {
                                             title: (
                                                <div className="flex justify-between">
                                                   <div className="text-sm font-semibold">
                                                      {warrantyIssues.assemble?.typeError.name}
                                                   </div>
                                                   <RightOutlined className="text-xs" />
                                                </div>
                                             ),
                                             description: (
                                                <div className="text-xs">
                                                   {warrantyIssues.assemble?.typeError.description}
                                                </div>
                                             ),
                                             status: (function () {
                                                switch (warrantyIssues.assemble?.status) {
                                                   case IssueStatusEnum.RESOLVED:
                                                      return "finish"
                                                   case IssueStatusEnum.FAILED:
                                                   case IssueStatusEnum.CANCELLED:
                                                      return "error"
                                                   default:
                                                      return "wait"
                                                }
                                             })(),
                                             onClick: () =>
                                                control_issueViewDetailsWarrantyDrawer.current?.handleOpen({
                                                   issueId: warrantyIssues.assemble?.id,
                                                   requestId: props.api_request.data?.id,
                                                }),
                                          },
                                       ]}
                                    />
                                    {receiveWarrantyTask.status === TaskStatus.HEAD_STAFF_CONFIRM && (
                                       <Button
                                          block
                                          type="primary"
                                          className="mt-2"
                                          onClick={() => {
                                             control_qrScanner.handleOpenScanner()
                                          }}
                                       >
                                          Kiểm tra tác vụ
                                       </Button>
                                    )}
                                 </div>
                              ),
                           },
                        ]}
                     />
                  )}
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
                              Đóng yêu cầu
                           </Button>
                        </section>
                     )}
               </div>
            )}
         </ConfigProvider>
         <OverlayControllerWithRef ref={control_issueViewDetailsWarrantyDrawer}>
            <Issue_ViewDetails_WarrantyDrawer refetchFn={() => props.api_request.refetch()} />
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
         {control_qrScanner.contextHolder()}
         <OverlayControllerWithRef ref={control_taskVerifyComplete_warrantyDrawer}>
            <Task_VerifyComplete_WarrantyDrawer onSubmit={() => {}} />
         </OverlayControllerWithRef>
      </section>
   )
}

export default WarrantyTab
