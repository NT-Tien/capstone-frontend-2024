"use client"

import headstaff_qk from "@/features/head-maintenance/qk"
import HeadStaff_Request_UpdateStatus from "@/features/head-maintenance/api/request/updateStatus.api"
import HeadStaff_Task_OneById from "@/features/head-maintenance/api/task/one-byId.api"
import HeadStaff_Task_UpdateAwaitSparePartToAssignFixer from "@/features/head-maintenance/api/task/update-awaitSparePartToAssignFixer.api"
import HeadStaff_Task_UpdateComplete from "@/features/head-maintenance/api/task/update-complete.api"
import Issue_ViewDetailsDrawer, {
   IssueDetailsDrawerRefType,
} from "@/features/head-maintenance/components/overlays/Issue_ViewDetails.drawer"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import useModalControls from "@/lib/hooks/useModalControls"
import { cn } from "@/lib/utils/cn.util"
import AlertCard from "@/components/AlertCard"
import { ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import { EditOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons"
import {
   ArrowElbowDownRight,
   CalendarBlank,
   CheckCircle,
   Circle,
   Clock,
   Gear,
   ImageSquare,
   Pen,
   Users,
   WashingMachine,
   XCircle,
} from "@phosphor-icons/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { App, Button, Card, Drawer, Dropdown, Spin, Tag } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { forwardRef, ReactNode, useImperativeHandle, useMemo, useRef, useState } from "react"
import Task_AssignFixerDrawer, { AssignFixerDrawerRefType } from "../Task_AssignFixer.drawer"
import Task_CancelDrawer, { CancelTaskDrawerRefType } from "../Task_Cancel.drawer"
import Task_UpdateFixDateDrawer, { UpdateTaskFixDateDrawerRefType } from "../Task_UpdateFixDate.drawer"
import ScannerV2Drawer, { ScannerV2DrawerRefType } from "@/components/overlays/ScannerV2.drawer"
import Task_VerifyCompleteDrawer, {
   Task_VerifyCompleteDrawerProps,
} from "@/features/head-maintenance/components/overlays/Task_VerifyComplete.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Task_VerifyComplete_WarrantyDrawer, {
   Task_VerifyComplete_WarrantyDrawerProps,
} from "@/features/head-maintenance/components/overlays/warranty/Task_VerifyComplete_Warranty.drawer"
import Task_VerifyComplete_IssueFailedDrawer, {
   Task_VerifyComplete_IssueFailedDrawerProps,
} from "@/features/head-maintenance/components/overlays/Task_VerifyComplete_IssueFailed.drawer"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import Task_CreateDrawer, {
   CreateTaskV2DrawerProps,
} from "@/features/head-maintenance/components/overlays/Task_Create.drawer"
import IssueDetailsDrawer, {
   IssueDetailsDrawerProps,
} from "@/features/head-maintenance/components/overlays/Issue_Details.drawer"
import hm_uris from "@/features/head-maintenance/uri"
import Task_UpdateFixerAndFixerDate, {
   Task_UpdateFixerAndFixerDateRefType,
} from "@/features/head-maintenance/components/overlays/Task_UpdateFixerAndFixerDate.drawer"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import head_maintenance_queries from "@/features/head-maintenance/queries"

export type Task_ViewDetailsDrawerWarrantyRefType = {
   handleOpen: (task: TaskDto, requestId: string, isDisabled?: boolean) => void
}

type Props = {
   children?: (handleOpen: (task: TaskDto, requestId: string, isDisabled?: boolean) => void) => ReactNode
   refetchFn?: () => Promise<void>
   autoCreateTaskFn?: (warrantyDate?: string) => Promise<void>
}

const Task_ViewDetailsDrawerWarranty = forwardRef<Task_ViewDetailsDrawerWarrantyRefType, Props>(
   function Component(props, ref) {
      const { open, handleOpen, handleClose } = useModalControls({
         onOpen: (task: TaskDto, requestId: string, isDisabled?: boolean) => {
            setTask(task)
            setRequestId(requestId)
            setIsDisabled(isDisabled ?? false)
         },
         onClose: () => {
            setTimeout(() => {
               setTask(null)
               setRequestId("")
               setIsDisabled(false)
            }, 200)
         },
      })
      const router = useRouter()
      const { message } = App.useApp()
      const queryClient = useQueryClient()

      const [task, setTask] = useState<TaskDto | null>(null)
      const [requestId, setRequestId] = useState<string>("")
      const [isDisabled, setIsDisabled] = useState<boolean>(false)

      const scannerV2DrawerRef = useRef<ScannerV2DrawerRefType | null>(null)
      const issueDetailsDrawerRef = useRef<IssueDetailsDrawerRefType | null>(null)
      const assignFixerDrawerRef = useRef<AssignFixerDrawerRefType | null>(null)
      const updateTaskFixDateDrawerRef = useRef<UpdateTaskFixDateDrawerRefType | null>(null)
      const cancelTaskDrawerRef = useRef<CancelTaskDrawerRefType | null>(null)
      const control_taskVerifyCompleteDrawer = useRef<RefType<Task_VerifyCompleteDrawerProps>>(null)
      const control_taskVerifyComplete_warrantyDrawer = useRef<RefType<Task_VerifyComplete_WarrantyDrawerProps>>(null)
      const control_taskVerifyComplete_issueFailedDrawer =
         useRef<RefType<Task_VerifyComplete_IssueFailedDrawerProps>>(null)
      const control_taskCreateDrawer = useRef<RefType<CreateTaskV2DrawerProps>>(null)
      const control_issueDetailsDrawer = useRef<RefType<IssueDetailsDrawerProps>>(null)
      const control_taskUpdateFixerAndFixerDateDrawer = useRef<Task_UpdateFixerAndFixerDateRefType | null>(null)

      function handleOpenTaskVerifyComplete() {
         if (!api_task.isSuccess) return
         if (isWarrantyTask) {
            control_taskVerifyComplete_warrantyDrawer.current?.handleOpen({ task: api_task.data })
            return
         }
         if (api_task.data.issues.find((i) => i.status === IssueStatusEnum.FAILED)) {
            control_taskVerifyComplete_issueFailedDrawer.current?.handleOpen({ task: api_task.data })
            return
         }

         control_taskVerifyCompleteDrawer.current?.handleOpen({ task: api_task.data, requestId: requestId })
      }

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

      const mutate_closeTask = head_maintenance_mutations.task.close()
      const mutate_createIssues = head_maintenance_mutations.issue.createMany()

      const mutate_updateRequest = useMutation({
         mutationFn: HeadStaff_Request_UpdateStatus,
      })

      const mutate_checkSparePartStock = useMutation({
         mutationFn: HeadStaff_Task_UpdateAwaitSparePartToAssignFixer,
      })

      const mutate_finishRequest = head_maintenance_mutations.request.finish()

      async function handleCheckTask(newIssues?: IssueDto[]) {
         try {
            if (!task) return
            await mutate_closeTask.mutateAsync({
               id: task.id,
            })

            if (newIssues && newIssues.length > 0) {
               await mutate_createIssues.mutateAsync({
                  request: requestId,
                  issues: newIssues.map((i) => ({
                     description: i.description,
                     fixType: i.fixType,
                     typeError: i.typeError.id,
                     spareParts: i.issueSpareParts.map((sp) => ({
                        sparePart: sp.sparePart.id,
                        quantity: sp.quantity,
                     })),
                  })),
               })
            }

            handleClose()
            await props.refetchFn?.()
         } catch (e) {
            console.error(e)
         }
      }

      async function handleUpdateConfirmCheck() {
         if (!task || !api_task.isSuccess) return

         await mutate_updateStatus.mutateAsync(
            {
               id: api_task.data.id,
            },
            {
               onSuccess: async () => {
                  handleClose()
                  await props.refetchFn?.()
               },
            },
         )

         const request = await queryClient.ensureQueryData(
            head_maintenance_queries.request.one.queryOptions({
               id: requestId,
            }),
         )

         if (request.tasks.every((t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.CANCELLED)) {
            await mutate_finishRequest.mutateAsync({
               id: requestId,
            })
         }
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

      const isMissingSpareParts = useMemo(() => {
         return api_task.data?.issues
            .flatMap((issue) => issue.issueSpareParts)
            .find((sp) => sp.quantity > sp.sparePart.quantity)

         // return api_task.data?.issues.find(
         //    (issue) => issue.issueSpareParts.filter((sp) => sp.quantity > sp.sparePart.quantity).length > 0,
         // )
      }, [api_task.data?.issues])

      function Footer() {
         if (!task) return null

         if (isDisabled) {
            return <AlertCard text={"Vui lòng chờ tác vụ trước hoàn thành"} type={"info"} />
         }

         if (task.status === TaskStatus.AWAITING_FIXER) {
            return (
               <Button
                  type="primary"
                  className="w-full"
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
            )
         }

         if (task.status === TaskStatus.CANCELLED) {
            return (
               <Button
                  type="primary"
                  className="w-full"
                  onClick={() => {
                     const lastIssuesDataJson = task?.last_issues_data
                     const parsedLastIssuesDataJson = lastIssuesDataJson ? JSON.parse(lastIssuesDataJson) : []
                     const issues = parsedLastIssuesDataJson.map((issue: any) => issue.id)
                     console.log("issues here", issues, task.issues)

                     handleClose()
                     setTimeout(() => {
                        requestId &&
                           control_taskCreateDrawer.current?.handleOpen({
                              requestId: requestId,
                              defaultIssueIds: issues,
                           })
                     }, 200)
                  }}
               >
                  Tạo lại tác vụ
               </Button>
            )
         }

         const check = new Set([TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED])
         if (check.has(task.status)) {
            return null
            // return (
            //    <Button
            //       type="default"
            //       className="w-full"
            //       onClick={() => {
            //          message.info("Not implemented")
            //       }}
            //    >
            //       Xem chi tiết
            //    </Button>
            // )
         }

         if (task.status === TaskStatus.HEAD_STAFF_CONFIRM) {
            return (
               <>
                  <AlertCard
                     text="Vui lòng kiểm tra kết quả sửa chữa máy và chữ ký của nhân viên."
                     className="mb-layout-half"
                     type="info"
                  />
                  <Button
                     type="primary"
                     className="w-full"
                     onClick={() => {
                        if (!api_task.isSuccess) return
                        if (isSendWarrantyTask) {
                           control_taskVerifyComplete_warrantyDrawer.current?.handleOpen({ task: api_task.data })
                           return
                        }
                        const cache = localStorage.getItem("head_staff_confirm_device_ids")
                        if (cache) {
                           const cacheArr = JSON.parse(cache) as string[]
                           if (cacheArr.includes(api_task.data.device.id)) {
                              handleOpenTaskVerifyComplete()
                           } else {
                              scannerV2DrawerRef.current?.handleOpen()
                           }
                        } else {
                           scannerV2DrawerRef.current?.handleOpen()
                        }
                     }}
                  >
                     Xác nhận hoàn thành
                  </Button>
               </>
            )
         }

         return null
      }

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
               footer={<Footer />}
               extra={
                  <div className="flex items-center gap-1">
                     {task && task.status === TaskStatus.ASSIGNED && (
                        <Button
                           icon={<EditOutlined />}
                           type="text"
                           onClick={() => {
                              if (!task) return
                              control_taskUpdateFixerAndFixerDateDrawer.current?.handleOpen(task.id, {
                                 priority: task.priority,
                                 fixerDate: dayjs(task.fixerDate).add(7, "hours"),
                                 fixer: task.fixer,
                              })
                           }}
                        />
                     )}
                     <Dropdown
                        menu={{
                           items: [
                              {
                                 label: "Chi tiết",
                                 key: "detail",
                                 onClick: () => message.info("Not implemented"),
                              },
                              ...(task &&
                              new Set([
                                 TaskStatus.AWAITING_SPARE_SPART,
                                 TaskStatus.ASSIGNED,
                                 TaskStatus.AWAITING_FIXER,
                              ]).has(task.status)
                                 ? [
                                      {
                                         label: "Hủy tác vụ",
                                         danger: true,
                                         key: "cancel",
                                         onClick: () => {
                                            if (!task) return
                                            cancelTaskDrawerRef.current?.handleOpen({ task })
                                         },
                                      },
                                   ]
                                 : []),
                           ],
                        }}
                     >
                        <Button icon={<MoreOutlined />} type="text"></Button>
                     </Dropdown>
                  </div>
               }
               classNames={{
                  body: "px-0 pt-0 pb-0 std-layout text-neutral-800",
                  header: "px-layout border-none",
                  footer: "p-layout",
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
                     {api_task.data?.issues.find((i) => i.issueSpareParts.length > 0) && (
                        <div className="mt-layout flex items-center gap-3">
                           <Gear size={18} weight="fill" color="#737373" />
                           <div>Linh kiện: {api_task.data.export_warehouse_ticket[0]?.status}</div>
                        </div>
                     )}
                     <div className="mt-layout flex items-center gap-3">
                        <Users size={18} weight="fill" color="#737373" />
                        <div>{task.fixer?.username ?? "Chưa có"}</div>
                     </div>
                     {api_task.data?.status === TaskStatus.CANCELLED && (
                        <div className="mt-layout flex items-center gap-3">
                           <Pen size={18} weight="fill" color="#737373" />
                           <div>Lý do hủy: {task.cancelReason ?? "Chưa có"}</div>
                        </div>
                     )}
                     {api_task.data?.device_renew && (
                        <div
                           className="mt-layout flex items-center gap-3"
                           onClick={() => {
                              window.navigator.clipboard.writeText(api_task.data.device_renew.id)
                           }}
                        >
                           <WashingMachine size={18} weight="fill" color="#737373" />
                           <div>
                              {api_task.data.device_renew.machineModel.name} |{" "}
                              {api_task.data.device_renew.machineModel.manufacturer}
                           </div>
                        </div>
                     )}
                     <div className="mt-layout flex w-full items-stretch justify-start gap-3">
                        <ArrowElbowDownRight size={18} weight="fill" color="#737373" />
                        <div className="w-full">
                           <h3 className="mb-2 font-semibold">Bước trong tác vụ</h3>
                           <div className="flex w-full flex-col gap-3">
                              {api_task.isSuccess &&
                                 ((api_task.data.status === TaskStatus.COMPLETED ||
                                    api_task.data.status === TaskStatus.CANCELLED) &&
                                 api_task.data.issues.length === 0 &&
                                 api_task.data.last_issues_data
                                    ? JSON.parse(api_task.data?.last_issues_data ?? []).map((issue: IssueDto) => (
                                         <div
                                            key={issue.id}
                                            onClick={() =>
                                               control_issueDetailsDrawer.current?.handleOpen({
                                                  issueId: issue.id,
                                                  deviceId: api_task.data.device.id,
                                               })
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
                                                  {issue.typeError?.name ?? ""}
                                                  <div className="mt-1 w-[50vw] truncate text-sm text-neutral-400">
                                                     {issue.description}
                                                  </div>
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
                                      ))
                                    : api_task.data?.issues.map((issue) => (
                                         <div
                                            key={issue.id}
                                            onClick={() =>
                                               control_issueDetailsDrawer.current?.handleOpen({
                                                  issueId: issue.id,
                                                  deviceId: api_task.data.device.id,
                                               })
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
                                                  <div className="mt-1 w-[50vw] truncate text-neutral-400">
                                                     {issue.typeError.description}
                                                  </div>
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
                                      )))}
                           </div>
                        </div>
                     </div>
                  </>
               ) : (
                  <Card>
                     <div className="grid h-48 w-full place-items-center">
                        <Spin />
                     </div>
                  </Card>
               )}
            </Drawer>
            <Issue_ViewDetailsDrawer
               refetch={() => {}}
               showActions={false}
               ref={issueDetailsDrawerRef}
               drawerProps={{
                  placement: "bottom",
                  height: "75%",
               }}
            />
            <OverlayControllerWithRef ref={control_issueDetailsDrawer}>
               <IssueDetailsDrawer />
            </OverlayControllerWithRef>
            <OverlayControllerWithRef ref={control_taskVerifyCompleteDrawer}>
               <Task_VerifyCompleteDrawer onSubmit={(newIssues) => handleCheckTask(newIssues)} />
            </OverlayControllerWithRef>
            <OverlayControllerWithRef ref={control_taskVerifyComplete_warrantyDrawer}>
               <Task_VerifyComplete_WarrantyDrawer onSubmit={handleUpdateConfirmCheck} />
            </OverlayControllerWithRef>
            <OverlayControllerWithRef ref={control_taskVerifyComplete_issueFailedDrawer}>
               <Task_VerifyComplete_IssueFailedDrawer
                  onSubmit={() => {
                     handleCheckTask()
                     requestId && router.push(hm_uris.stack.requests_id_fix(requestId) + `?tab=issues`)
                  }}
               />
            </OverlayControllerWithRef>
            <Task_AssignFixerDrawer
               ref={assignFixerDrawerRef}
               refetchFn={props.refetchFn}
               afterFinish={() => {
                  handleClose()
               }}
            />
            <Task_UpdateFixDateDrawer ref={updateTaskFixDateDrawerRef} refetchFn={props.refetchFn} />
            <Task_UpdateFixerAndFixerDate
               ref={control_taskUpdateFixerAndFixerDateDrawer}
               refetchFn={props.refetchFn}
               afterFinish={() => {
                  handleClose()
               }}
            />
            <Task_CancelDrawer
               ref={cancelTaskDrawerRef}
               refetchFn={() => {
                  props.refetchFn?.()
                  handleClose()
               }}
            />
            <ScannerV2Drawer
               ref={scannerV2DrawerRef}
               alertText={
                  api_task.data?.device_renew
                     ? "Vui lòng đặt QR thiết bị MỚI vào khung hình"
                     : "Vui lòng đặt QR thiết bị vào khung hình"
               }
               onScan={(result) => {
                  if (!api_task.isSuccess) return

                  if (api_task.data.device_renew && api_task.data.device_renew.id !== result) {
                     message.error("Mã QR không đúng")
                     return
                  }

                  if (!api_task.data.device_renew && result !== api_task.data.device.id) {
                     message.error("Mã QR không đúng")
                     return
                  }

                  const cache = localStorage.getItem("head_staff_confirm_device_ids")
                  if (cache) {
                     const cacheArr = JSON.parse(cache) as string[]
                     localStorage.setItem("head_staff_confirm_device_ids", JSON.stringify([...cacheArr, result]))
                  } else {
                     localStorage.setItem("head_staff_confirm_device_ids", JSON.stringify([result]))
                  }
                  // scannerV2DrawerRef.current?.handleClose()
                  setTimeout(() => {
                     handleOpenTaskVerifyComplete()
                  }, 500)
               }}
            />
            <OverlayControllerWithRef ref={control_taskCreateDrawer}>
               <Task_CreateDrawer
                  refetchFn={() => {
                     props.refetchFn?.()
                  }}
               />
            </OverlayControllerWithRef>
         </>
      )
   },
)

export default Task_ViewDetailsDrawerWarranty