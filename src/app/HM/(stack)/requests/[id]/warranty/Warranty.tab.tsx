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
import { App, Divider, Dropdown, Space, Steps } from "antd"
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
   const { modal, message } = App.useApp()

   const control_issueViewDetailsWarrantyDrawer = useRef<RefType<Issue_ViewDetails_WarrantyDrawerProps>>(null),
      control_taskAssignFixerDrawer = useRef<RefType<Task_AssignFixerModalProps>>(null),
      control_taskVerifyComplete_warrantyDrawer = useRef<RefType<Task_VerifyComplete_WarrantyDrawerProps>>(null),
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
      mutate_updateTask = head_maintenance_mutations.task.update()

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
      
      if(warrantyIssues.receive?.status === IssueStatusEnum.RESOLVED) return "Bảo hành thành công"
   }, [warrantyIssues])

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

   return (
      <section className={cn("relative flex-1 pb-[80px]", props.className)}>
         {props.api_request.isSuccess && (
            <div className={"p-layout"}>
               <div className="mb-layout flex w-full rounded-lg bg-red-800 p-2 text-white">
                  <h3 className="mr-auto font-semibold">Trạng thái bảo hành</h3>
                  <p>{warrantyStatus}</p>
               </div>
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
                        // ! SEND TO WARRANTY TASK
                        {
                           title: (
                              <div className={"flex w-full items-center"}>
                                 <div className={"flex-grow text-base font-bold"}>Gửi máy đi bảo hành</div>
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
                                                sendWarrantyTask.status === TaskStatus.ASSIGNED && "flex",
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
                                 <div className="flex flex-col">
                                    <div>{sendWarrantyTask.name}</div>
                                    {sendWarrantyTask.status !== TaskStatus.AWAITING_FIXER && (
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
                                    )}
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
                                             <div className="text-xs">{warrantyIssues.send?.typeError.description}</div>
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
                        // ! RECEIVE FROM WARRANTY TASK
                        {
                           title: (
                              <div className={"flex w-full items-center"}>
                                 <div className={"flex-grow text-base font-bold"}>Nhận máy và lắp đặt</div>
                                 {isSendCompleted && (
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
                                                   receiveWarrantyTask.status === TaskStatus.ASSIGNED && "flex",
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
                                 )}
                              </div>
                           ),
                           description: (
                              <div className={cn("hidden flex-col text-xs", isSendCompleted && "flex")}>
                                 <div className="flex flex-col">
                                    <div>{receiveWarrantyTask.name}</div>
                                    {receiveWarrantyTask.status !== TaskStatus.AWAITING_FIXER && (
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
                                    )}
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
         {control_qrScanner.contextHolder()}
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
         <OverlayControllerWithRef ref={control_taskVerifyComplete_warrantyDrawer}>
            <Task_VerifyComplete_WarrantyDrawer onSubmit={() => props.api_request.refetch()} />
         </OverlayControllerWithRef>
         {sendWarrantyTask?.status === TaskStatus.COMPLETED &&
            receiveWarrantyTask?.status === TaskStatus.AWAITING_FIXER &&
            dayjs(props.api_request.data?.return_date_warranty).isSame(dayjs(), "day") && (
               <footer className="absolute bottom-0 left-0 z-50 w-full border-t-[1px] border-t-neutral-300 bg-white p-layout">
                  <Button
                     block
                     type="primary"
                     onClick={() =>
                        control_taskAssignFixerDrawer.current?.handleOpen({
                           defaults: {
                              date: props.api_request.data?.return_date_warranty
                                 ? new Date(props.api_request.data.return_date_warranty)
                                 : undefined,
                              priority: "normal",
                              fixer: sendWarrantyTask?.fixer ? sendWarrantyTask.fixer : undefined,
                           },
                           recommendedFixerIds: [sendWarrantyTask.fixer?.id],
                           taskId: receiveWarrantyTask.id,
                        })
                     }
                  >
                     Nhận máy đã bảo hành
                  </Button>
               </footer>
            )}
      </section>
   )
}

export default WarrantyTab
