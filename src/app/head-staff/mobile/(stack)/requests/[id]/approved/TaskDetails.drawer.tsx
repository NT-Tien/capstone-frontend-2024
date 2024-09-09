"use client"

import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Task_OneById from "@/app/head-staff/_api/task/one-byId.api"
import HeadStaff_Task_UpdateComplete from "@/app/head-staff/_api/task/update-complete.api"
import IssueDetailsDrawer, { IssueDetailsDrawerRefType } from "@/app/head-staff/_components/IssueDetailsDrawer"
import { TaskDto } from "@/common/dto/Task.dto"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import useModalControls from "@/common/hooks/useModalControls"
import { cn } from "@/common/util/cn.util"
import { ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/constants/Warranty"
import { EditOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons"
import {
   ArrowElbowDownRight,
   CalendarBlank,
   CheckCircle,
   Circle,
   Clock,
   ImageSquare,
   Users,
   XCircle,
} from "@phosphor-icons/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Button, Card, Drawer, Dropdown, Spin, Tag } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { forwardRef, ReactNode, useImperativeHandle, useMemo, useRef, useState } from "react"
import AssignFixerDrawer, { AssignFixerDrawerRefType } from "../../../tasks/[id]/AssignFixer.drawer"
import CheckSignatureDrawer, { CheckSignatureDrawerRefType } from "./CheckSignature.drawer"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import UpdateTaskFixDateDrawer, { UpdateTaskFixDateDrawerRefType } from "./UpdateTaskFixDate.drawer"

export type TaskDetailsDrawerRefType = {
   handleOpen: (task: TaskDto) => void
}

type Props = {
   children?: (handleOpen: (task: TaskDto) => void) => ReactNode
   refetchFn?: () => Promise<void>
   autoCreateTaskFn?: (warrantyDate?: string) => Promise<void>
}

const TaskDetailsDrawer = forwardRef<TaskDetailsDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (task: TaskDto) => {
         setTask(task)
      },
      onClose: () => {
         setTimeout(() => {
            setTask(null)
         }, 500)
      },
   })
   const router = useRouter()
   const { message } = App.useApp()

   const [task, setTask] = useState<TaskDto | null>(null)
   const issueDetailsDrawerRef = useRef<IssueDetailsDrawerRefType | null>(null)
   const assignFixerDrawerRef = useRef<AssignFixerDrawerRefType | null>(null)
   const checkSignatureDrawerRef = useRef<CheckSignatureDrawerRefType | null>(null)
   const updateTaskFixDateDrawerRef = useRef<UpdateTaskFixDateDrawerRefType | null>(null)

   const api_task = useQuery({
      queryKey: headstaff_qk.task.byId(task?.id ?? ""),
      queryFn: () => HeadStaff_Task_OneById({ id: task?.id ?? "" }),
      enabled: !!task?.id,
   })

   const mutate_updateStatus = useMutation({
      mutationFn: HeadStaff_Task_UpdateComplete,
      onSuccess: async () => {
         message.success("Xác nhận thành công")
      },
      onMutate: async () => {
         message.destroy("loading")
         message.loading({
            content: "Đang xác nhận...",
            key: "loading",
         })
      },
      onSettled: () => {
         message.destroy("loading")
      },
      onError: async () => {
         message.error("Xác nhận thất bại")
      },
   })

   const mutate_updateRequest = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
   })

   async function handleUpdateConfirmCheck(warrantyDate?: string) {
      if (!task || !api_task.isSuccess) return

      await mutate_updateRequest.mutateAsync({
         id: api_task.data.request.id,
         payload: {
            return_date_warranty: warrantyDate,
         },
      })

      await mutate_updateStatus.mutateAsync(
         {
            id: task.id,
         },
         {
            onSuccess: async () => {
               handleClose()
               await props.refetchFn?.()
               if (isWarrantyTask) {
                  props.autoCreateTaskFn?.(warrantyDate)
               }
            },
         },
      )
   }

   const isReceiveWarrantyTask = useMemo(() => {
      if (!api_task.isSuccess) return
      return !!api_task.data.issues.find((issue) => issue.typeError.id === ReceiveWarrantyTypeErrorId)
   }, [api_task.data?.issues, api_task.isSuccess])

   const isSendWarrantyTask = useMemo(() => {
      if (!api_task.isSuccess) return
      return !!api_task.data.issues.find((issue) => issue.typeError.id === SendWarrantyTypeErrorId)
   }, [api_task.data?.issues, api_task.isSuccess])

   const isWarrantyTask = useMemo(() => {
      return isReceiveWarrantyTask || isSendWarrantyTask
   }, [isReceiveWarrantyTask, isSendWarrantyTask])

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <>
         {props.children?.(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            placement="bottom"
            height="85%"
            extra={
               <div className="flex items-center gap-1">
                  {task && new Set(TaskStatus.ASSIGNED).has(task.status) && (
                     <Button
                        icon={<EditOutlined />}
                        type="text"
                        size="large"
                        onClick={() => {
                           if (!task) return
                           assignFixerDrawerRef.current?.handleOpen(task.id, {
                              priority: task.priority,
                              fixerDate: dayjs(task.fixerDate).add(7, "hours"),
                              fixer: task.fixer,
                           })
                        }}
                     ></Button>
                  )}
                  {task && task.status === TaskStatus.AWAITING_FIXER && (
                     <Button
                        icon={<EditOutlined />}
                        type="text"
                        size="large"
                        onClick={() => {
                           if (!task) return
                           updateTaskFixDateDrawerRef.current?.handleOpen(task)
                        }}
                     ></Button>
                  )}
                  <Dropdown
                     menu={{
                        items: [
                           {
                              label: "Chi tiết",
                              key: "detail",
                              onClick: () => task && router.push(`/head-staff/mobile/tasks/${task.id}?goto=request`),
                           },
                        ],
                     }}
                  >
                     <Button icon={<MoreOutlined />} type="text" size="large"></Button>
                  </Dropdown>
               </div>
            }
            classNames={{
               body: "px-0 pt-0 pb-0 std-layout text-neutral-800",
               header: "px-layout border-none",
            }}
         >
            {task && api_task.isSuccess ? (
               <>
                  <div
                     className="min-h-[calc(18px * 1.3)] box-border flex items-stretch justify-start gap-3 text-lg"
                     style={{
                        flexFlow: "row nowrap",
                     }}
                  >
                     <div>
                        <div
                           className={cn(
                              "mx-0.5 aspect-square h-[16px] w-[16px] rounded-md bg-neutral-500",
                              isWarrantyTask && "bg-orange-500",
                           )}
                        />
                     </div>
                     <h2 className="w-full text-wrap break-words align-middle font-bold leading-[18px]">
                        {task?.name}
                        <div className="mt-2 flex items-center text-base font-normal">
                           {task.priority && <Tag color="red-inverse">Ưu tiên</Tag>}
                           <Tag color={TaskStatusTagMapper[task.status].colorInverse}>
                              {TaskStatusTagMapper[task.status].text}
                           </Tag>
                           {isWarrantyTask && <Tag color="orange-inverse">Bảo hành</Tag>}
                        </div>
                     </h2>
                  </div>
                  <div className="mt-layout flex items-center gap-3">
                     <Clock size={18} weight="fill" color="#737373" />
                     <div>{task.totalTime} phút</div>
                  </div>
                  <div className="mt-layout flex items-center gap-3">
                     <CalendarBlank weight="fill" size={18} color="#737373" />
                     <div>
                        {task.fixerDate ? dayjs(task.fixerDate).add(7, "hours").format("DD/MM/YYYY") : "Chưa có"}
                     </div>
                  </div>
                  <div className="mt-layout flex items-center gap-3">
                     <Users size={18} weight="fill" color="#737373" />
                     <div>{task.fixer?.username ?? "Chưa có"}</div>
                  </div>
                  <div className="mt-layout flex w-full items-stretch justify-start gap-3">
                     <ArrowElbowDownRight size={18} weight="fill" color="#737373" />
                     <div className="w-full">
                        <h3 className="mb-2 font-semibold">Lỗi cần sửa</h3>
                        <div className="flex w-full flex-col gap-3">
                           {api_task.data?.issues.map((issue) => (
                              <>
                                 <div
                                    key={issue.id}
                                    onClick={() =>
                                       issueDetailsDrawerRef.current?.openDrawer(
                                          issue.id,
                                          api_task.data.device.id,
                                          false,
                                       )
                                    }
                                 >
                                    <div className="flex items-stretch justify-start gap-2">
                                       <div>
                                          {issue.status === IssueStatusEnum.PENDING && <Circle size={18} />}
                                          {issue.status === IssueStatusEnum.RESOLVED && (
                                             <CheckCircle size={18} weight="fill" color="rgb(2, 134, 6)" />
                                          )}
                                          {issue.status === IssueStatusEnum.FAILED && (
                                             <XCircle size={18} weight="fill" color="rgb(173, 14, 14)" />
                                          )}
                                       </div>
                                       <div className="flex-grow">
                                          {issue.typeError.name}
                                          <div className="mt-1 text-neutral-400">{issue.description}</div>
                                       </div>
                                       <div className="flex gap-1">
                                          {task.status === TaskStatus.HEAD_STAFF_CONFIRM &&
                                             (issue.imagesVerify.find((e) => !!e) || !!issue.videosVerify) && (
                                                <ImageSquare
                                                   size={18}
                                                   weight="fill"
                                                   className="mt-[3px]"
                                                   color="rgb(51, 179, 22)"
                                                />
                                             )}
                                          <Button type="text" size="small" icon={<RightOutlined />} />
                                       </div>
                                    </div>
                                 </div>
                              </>
                           ))}
                        </div>
                     </div>
                  </div>

                  {task.status === TaskStatus.AWAITING_FIXER && (
                     <section className="fixed bottom-0 left-0 w-full bg-white p-layout shadow-lg">
                        <Button
                           type="primary"
                           className="w-full"
                           size="large"
                           onClick={() => {
                              assignFixerDrawerRef.current?.handleOpen(task.id, {
                                 priority: task.priority,
                                 fixerDate: dayjs(task.fixerDate).add(7, "hours"),
                                 fixer: task.fixer,
                              })
                           }}
                        >
                           Phân công tác vụ
                        </Button>
                     </section>
                  )}

                  {new Set([
                     TaskStatus.ASSIGNED,
                     TaskStatus.IN_PROGRESS,
                     TaskStatus.CANCELLED,
                     TaskStatus.COMPLETED,
                  ]).has(task.status) && (
                     <section className="fixed bottom-0 left-0 w-full bg-white p-layout shadow-lg">
                        <Button
                           type="default"
                           className="w-full"
                           size="large"
                           onClick={() => {
                              router.push(`/head-staff/mobile/tasks/${task.id}?goto=request`)
                           }}
                        >
                           Xem chi tiết
                        </Button>
                     </section>
                  )}

                  {task.status === TaskStatus.HEAD_STAFF_CONFIRM && (
                     <section className="fixed bottom-0 left-0 w-full bg-white p-layout shadow-lg">
                        <Button
                           type="primary"
                           className="w-full"
                           size="large"
                           onClick={() =>
                              api_task.isSuccess &&
                              checkSignatureDrawerRef.current?.handleOpen(api_task.data, isSendWarrantyTask)
                           }
                        >
                           Xác nhận hoàn thành
                        </Button>
                     </section>
                  )}
               </>
            ) : (
               <Card>
                  <div className="grid h-48 w-full place-items-center">
                     <Spin />
                  </div>
               </Card>
            )}
         </Drawer>
         <IssueDetailsDrawer
            refetch={() => {}}
            showActions={false}
            ref={issueDetailsDrawerRef}
            drawerProps={{
               placement: "bottom",
               height: "75%",
            }}
         />
         <AssignFixerDrawer
            ref={assignFixerDrawerRef}
            refetchFn={props.refetchFn}
            afterFinish={() => {
               handleClose()
            }}
         />
         <CheckSignatureDrawer ref={checkSignatureDrawerRef} onSubmit={handleUpdateConfirmCheck} />
         <UpdateTaskFixDateDrawer ref={updateTaskFixDateDrawerRef} refetchFn={props.refetchFn} />
      </>
   )
})

export default TaskDetailsDrawer
