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
import { Task_ViewDetailsDrawerRenewRefType } from "@/features/head-maintenance/components/overlays/renew/Task_ViewDetails_Renew.drawer"
import { Issue_ViewDetails_RenewDrawerProps } from "@/features/head-maintenance/components/overlays/renew/Issue_ViewDetails_Renew.drawer"
import { NewDeviceInstallation, RemoveOldDeviceTypeErrorId } from "@/lib/constants/Renew"

type Props = {
   api_request: UseQueryResult<RequestDto, Error>
   className?: string
   highlightTaskId?: Set<String>
   handleOpenCreateTask?: () => void
   disabledCreateTask?: boolean

   onSuccess_FinishRequest?: () => void
}

function RenewTab(props: Props) {
   const taskDetailsRef = useRef<Task_ViewDetailsDrawerRenewRefType | null>(null)
   const control_issueViewDetailsRenewDrawer = useRef<RefType<Issue_ViewDetails_RenewDrawerProps>>(null)
   const { message, modal } = App.useApp()

   const mutate_finishRequest = head_maintenance_mutations.request.finish()

   const removeDeviceTask = useMemo(() => {
      if (!props.api_request.isSuccess) return

      return props.api_request.data.tasks
         .filter((t) =>
            t.issues.find(
               (i) => i.typeError.id === RemoveOldDeviceTypeErrorId,
            ),
         )
         .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))[0]
   }, [props.api_request.data?.tasks, props.api_request.isSuccess])

   const installedDeviceTask = useMemo(() => {
      if (!props.api_request.isSuccess) return

      return props.api_request.data.tasks
         .filter((t) =>
            t.issues.find(
               (i) => i.typeError.id === NewDeviceInstallation,
            ),
         )
         .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))[0]
   }, [props.api_request.data?.tasks, props.api_request.isSuccess])

   const renewIssues = useMemo(() => {
      const remove = TaskUtil.getTask_Renew_FirstIssue(installedDeviceTask)
      const install = TaskUtil.getTask_Renew_SecondIssue(removeDeviceTask)

      return {
         remove,
         install,
      }
   }, [installedDeviceTask, removeDeviceTask])

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
                  {removeDeviceTask && installedDeviceTask && (
                     <Steps
                        current={(function () {
                           if (
                              removeDeviceTask.status === TaskStatus.COMPLETED &&
                              removeDeviceTask.issues.every((i) => i.status === IssueStatusEnum.RESOLVED)
                           )
                              return 1
                           return 0
                        })()}
                        status={(function () {
                           if (removeDeviceTask.issues.find((i) => i.status === IssueStatusEnum.FAILED)) return "error"

                           if (installedDeviceTask.issues.find((i) => i.status === IssueStatusEnum.FAILED))
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
                                       taskDetailsRef.current?.handleOpen(removeDeviceTask, props.api_request.data?.id)
                                    }
                                 >
                                    <div className={"text-base font-bold"}>Tháo máy</div>
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
                                             removeDeviceTask,
                                             props.api_request.data?.id,
                                          )
                                       }
                                    >
                                       <span>Tháo gỡ máy</span>
                                       <Space
                                          split={<Divider type={"vertical"} className={"m-0"} />}
                                          className={"mt-2"}
                                       >
                                          <div
                                             className={cn(
                                                "flex items-center gap-1",
                                                TaskStatusTagMapper[removeDeviceTask.status].className,
                                             )}
                                          >
                                             {TaskStatusTagMapper[removeDeviceTask.status].icon}
                                             {TaskStatusTagMapper[removeDeviceTask.status].text}
                                          </div>
                                          {removeDeviceTask.fixer && (
                                             <div className={cn("flex items-center gap-1")}>
                                                <User size={16} weight={"duotone"} />
                                                {removeDeviceTask.fixer.username}
                                             </div>
                                          )}
                                          {removeDeviceTask.fixerDate && (
                                             <div className={cn("flex items-center gap-1")}>
                                                <Calendar size={16} weight={"duotone"} />
                                                {dayjs(removeDeviceTask.fixerDate).format("DD/MM/YYYY")}
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
                                                      {renewIssues.remove?.typeError.name}
                                                   </div>
                                                   <RightOutlined className="text-xs" />
                                                </div>
                                             ),
                                             description: (
                                                <div className="text-xs">
                                                   {renewIssues.remove?.typeError.description}
                                                </div>
                                             ),
                                             status: (function () {
                                                switch (renewIssues.remove?.status) {
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
                                                control_issueViewDetailsRenewDrawer.current?.handleOpen({
                                                   issueId: renewIssues.remove?.id,
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
                                 removeDeviceTask.status !== TaskStatus.COMPLETED ||
                                 !!removeDeviceTask.issues.find((i) => i.status !== IssueStatusEnum.RESOLVED),
                              className: cn(
                                 removeDeviceTask.status !== TaskStatus.COMPLETED && "opacity-30",
                                 "steps-title-w-ful",
                              ),
                              title: (
                                 <div
                                    className={"flex items-center justify-between"}
                                    onClick={() =>
                                       props.api_request.isSuccess &&
                                       taskDetailsRef.current?.handleOpen(
                                          installedDeviceTask,
                                          props.api_request.data?.id,
                                          removeDeviceTask.status !== TaskStatus.COMPLETED,
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
                                             TaskStatusTagMapper[installedDeviceTask.status].className,
                                          )}
                                       >
                                          {TaskStatusTagMapper[installedDeviceTask.status].icon}
                                          {TaskStatusTagMapper[installedDeviceTask.status].text}
                                       </div>
                                       {installedDeviceTask.fixer && (
                                          <div className={cn("flex items-center gap-1")}>
                                             <User size={16} weight={"duotone"} />
                                             {installedDeviceTask.fixer.username}
                                          </div>
                                       )}
                                       {installedDeviceTask.fixerDate && (
                                          <div className={cn("flex items-center gap-1")}>
                                             <Calendar size={16} weight={"duotone"} />
                                             {dayjs(installedDeviceTask.fixerDate).format("DD/MM/YYYY")}
                                          </div>
                                       )}
                                    </Space>
                                    <Steps
                                       className="steps-title-w-full mt-2"
                                       progressDot
                                       size="small"
                                       items={[
                                        //   {
                                        //      title: (
                                        //         <div className="flex justify-between">
                                        //            <div className="text-sm font-semibold">
                                        //               {renewIssues.receive?.typeError.name}
                                        //            </div>
                                        //            <RightOutlined className="text-xs" />
                                        //         </div>
                                        //      ),
                                        //      description: (
                                        //         <div className="text-xs">
                                        //            {renewIssues.receive?.typeError.description}
                                        //         </div>
                                        //      ),
                                        //      status: (function () {
                                        //         switch (renewIssues.receive?.status) {
                                        //            case IssueStatusEnum.RESOLVED:
                                        //               return "finish"
                                        //            case IssueStatusEnum.FAILED:
                                        //            case IssueStatusEnum.CANCELLED:
                                        //               return "error"
                                        //            default:
                                        //               return "wait"
                                        //         }
                                        //      })(),
                                        //      onClick: () =>
                                        //         control_issueViewDetailsRenewDrawer.current?.handleOpen({
                                        //            issueId: renewIssues.receive?.id,
                                        //            requestId: props.api_request.data?.id,
                                        //         }),
                                        //   },
                                          {
                                             title: (
                                                <div className="flex justify-between">
                                                   <div className="text-sm font-semibold">
                                                      {renewIssues.install?.typeError.name}
                                                   </div>
                                                   <RightOutlined className="text-xs" />
                                                </div>
                                             ),
                                             description: (
                                                <div className="text-xs">
                                                   {renewIssues.install?.typeError.description}
                                                </div>
                                             ),
                                             status: (function () {
                                                switch (renewIssues.install?.status) {
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
                                                control_issueViewDetailsRenewDrawer.current?.handleOpen({
                                                   issueId: renewIssues.install?.id,
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
                              Hoàn tất yêu cầu
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
         <OverlayControllerWithRef ref={control_issueViewDetailsRenewDrawer}>
            <Issue_ViewDetails_WarrantyDrawer refetchFn={() => props.api_request.refetch()} />
         </OverlayControllerWithRef>
      </section>
   )
}

export default RenewTab
