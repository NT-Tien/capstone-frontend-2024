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
} from "@/features/head-maintenance/components/overlays/warranty/Task_ViewDetails_Warranty.drawer"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { RightOutlined } from "@ant-design/icons"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import TaskUtil from "@/lib/domain/Task/Task.util"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Issue_ViewDetails_WarrantyDrawer, {
   Issue_ViewDetails_WarrantyDrawerProps,
} from "@/features/head-maintenance/components/overlays/warranty/Issue_ViewDetails_Warranty.drawer"

type Props = {
   api_request: UseQueryResult<RequestDto, Error>
   className?: string
   highlightTaskId?: Set<String>
   handleOpenCreateTask?: () => void
   disabledCreateTask?: boolean

   onSuccess_FinishRequest?: () => void
}

function WarrantyTab(props: Props) {
   const taskDetailsRef = useRef<Task_ViewDetailsDrawerWarrantyRefType | null>(null)
   const control_issueViewDetailsWarrantyDrawer = useRef<RefType<Issue_ViewDetails_WarrantyDrawerProps>>(null)
   const { message, modal } = App.useApp()

   const mutate_finishRequest = head_maintenance_mutations.request.finish()

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
                           if (
                              sendWarrantyTask.status === TaskStatus.COMPLETED &&
                              sendWarrantyTask.issues.every((i) => i.status === IssueStatusEnum.RESOLVED)
                           )
                              return 1
                           return 0
                        })()}
                        status={(function () {
                           if (sendWarrantyTask.issues.find((i) => i.status === IssueStatusEnum.FAILED)) return "error"

                           if (receiveWarrantyTask.issues.find((i) => i.status === IssueStatusEnum.FAILED))
                              return "error"
                        })()}
                        className="steps-title-w-full"
                        items={[
                           {
                              title: (
                                 <div
                                    className={"flex w-full items-center justify-between"}
                                    onClick={() =>
                                       props.api_request.isSuccess &&
                                       taskDetailsRef.current?.handleOpen(sendWarrantyTask, props.api_request.data?.id)
                                    }
                                 >
                                    <div className={"text-base font-bold"}>Gửi máy đi bảo hành</div>
                                    <RightOutlined className="text-sm" />
                                 </div>
                              ),
                              // status: (function () {
                              //    if (sendWarrantyTask?.status === TaskStatus.IN_PROGRESS) return "process"
                              //    if (sendWarrantyTask?.status === TaskStatus.COMPLETED) return "finish"
                              //    return "wait"
                              // })(),
                              description: (
                                 <div className={"flex flex-col text-xs"}>
                                    <div
                                       onClick={() =>
                                          props.api_request.isSuccess &&
                                          taskDetailsRef.current?.handleOpen(
                                             sendWarrantyTask,
                                             props.api_request.data?.id,
                                          )
                                       }
                                    >
                                       <span>Tháo gỡ và gửi máy đến trung tâm bảo hành</span>
                                       <Space
                                          split={<Divider type={"vertical"} className={"m-0"} />}
                                          className={"mt-2"}
                                       >
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
                                    <Steps
                                       className="steps-title-w-full mt-2"
                                       progressDot
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
                              disabled:
                                 sendWarrantyTask.status !== TaskStatus.COMPLETED ||
                                 !!sendWarrantyTask.issues.find((i) => i.status !== IssueStatusEnum.RESOLVED),
                              className: cn(
                                 sendWarrantyTask.status !== TaskStatus.COMPLETED && "opacity-30",
                                 "steps-title-w-ful",
                              ),
                              title: (
                                 <div
                                    className={"flex items-center justify-between"}
                                    onClick={() =>
                                       props.api_request.isSuccess &&
                                       taskDetailsRef.current?.handleOpen(
                                          receiveWarrantyTask,
                                          props.api_request.data?.id,
                                          sendWarrantyTask.status !== TaskStatus.COMPLETED,
                                       )
                                    }
                                 >
                                    <div className={"text-base font-bold"}>Đem mày về và lắp đặt</div>
                                    <RightOutlined className="text-sm" />
                                 </div>
                              ),
                              // status: (function () {
                              //    if (receiveWarrantyTask?.status === TaskStatus.IN_PROGRESS) return "process"
                              //    if (receiveWarrantyTask?.status === TaskStatus.COMPLETED) return "finish"
                              //    return "wait"
                              // })(),
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
                                    <Steps
                                       className="steps-title-w-full mt-2"
                                       progressDot
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
         <Task_ViewDetailsDrawerWarranty
            ref={taskDetailsRef}
            refetchFn={async () => {
               await props.api_request.refetch()
            }}
         />
         <OverlayControllerWithRef ref={control_issueViewDetailsWarrantyDrawer}>
            <Issue_ViewDetails_WarrantyDrawer refetchFn={() => props.api_request.refetch()} />
         </OverlayControllerWithRef>
      </section>
   )
}

export default WarrantyTab
