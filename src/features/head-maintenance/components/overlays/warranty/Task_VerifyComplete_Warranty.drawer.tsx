"use client"

import BackendImage from "@/components/BackendImage"
import ClickableArea from "@/components/ClickableArea"
import SignatureUploader from "@/components/SignatureUploader"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { clientEnv } from "@/env"
import Request_ApproveToRenewDrawer, {
   Request_ApproveToRenewDrawerProps,
} from "@/features/head-maintenance/components/overlays/renew/Request_ApproveToRenew.drawer"
import Request_ApproveToFixDrawer, {
   Request_ApproveToFixDrawerProps,
} from "@/features/head-maintenance/components/overlays/Request_ApproveToFix.drawer"
import IssueFailed_ResolveOptions, {
   IssueFailed_ResolveOptionsProps,
} from "@/features/head-maintenance/components/overlays/warranty/IssueFailed_ResolveOptions.modal"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import hm_uris from "@/features/head-maintenance/uri"
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
import { CheckOutlined, CloseOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons"
import { ChartDonut, Clock, Images, Note, User } from "@phosphor-icons/react"
import { Avatar, Button, Descriptions, Drawer, DrawerProps, Dropdown, Image } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useMemo, useRef } from "react"

type Task_VerifyComplete_WarrantyDrawerProps = {
   task?: TaskDto
   request?: RequestDto
   onSubmit?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   Task_VerifyComplete_WarrantyDrawerProps & {
      handleClose?: () => void
   }

function Task_VerifyComplete_WarrantyDrawer(props: Props) {
   const router = useRouter()

   const control_issueFailedResolveOptionsDrawer = useRef<RefType<IssueFailed_ResolveOptionsProps>>(null)
   const control_requestApproveToFixDrawer = useRef<RefType<Request_ApproveToFixDrawerProps>>(null)
   const control_requestApproveToRenewDrawer = useRef<RefType<Request_ApproveToRenewDrawerProps>>(null)

   const mutate_completeTask = head_maintenance_mutations.task.close()
   const mutate_closeRequest = head_maintenance_mutations.request.finish()

   const sendWarrantyTask = useMemo(() => {
      if (!props.request) return
      return props.request.tasks
         .filter((t) =>
            t.issues.find(
               (i) => i.typeError.id === SendWarrantyTypeErrorId || i.typeError.id === DisassembleDeviceTypeErrorId,
            ),
         )
         .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))[0]
   }, [props.request])

   const receiveWarrantyTask = useMemo(() => {
      if (!props.request) return

      return props.request.tasks
         .filter((t) =>
            t.issues.find(
               (i) => i.typeError.id === ReceiveWarrantyTypeErrorId || i.typeError.id === AssembleDeviceTypeErrorId,
            ),
         )
         .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))[0]
   }, [props.request])

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

   const hasFailedWarranty = useMemo(() => {
      return warrantyIssues.receive?.status === IssueStatusEnum.FAILED
   }, [warrantyIssues])

   function Footer() {
      if (hasFailedWarranty) {
         return (
            <Button
               size="large"
               block
               type="primary"
               onClick={() => {
                  control_issueFailedResolveOptionsDrawer.current?.handleOpen({})
               }}
               icon={<RightOutlined />}
               iconPosition="end"
            >
               Tiếp tục
            </Button>
         )
      }

      return (
         <div className="flex items-center gap-3">
            <Button
               block
               type="primary"
               onClick={() => {
                  const request = props.request
                  const task = props.task
                  if(!request || !task) return
                     mutate_completeTask.mutate({
                        id: task.id,
                     }, {
                        onSuccess: () => {
                           mutate_closeRequest.mutate(
                              {
                                 id: request.id,
                              },
                              {
                                 onSuccess: () => {
                                    router.push(`/HM/requests?status=${FixRequestStatus.HEAD_CONFIRM}`)
                                 },
                              },
                           )
                        }
                     })
               }}
            >
               Đóng yêu cầu
            </Button>
            <Dropdown
               menu={{
                  items: [
                     {
                        key: "1",
                        label: "Tiếp tục xử lý",
                        onClick: () => {
                           control_issueFailedResolveOptionsDrawer.current?.handleOpen({})
                        },
                     },
                  ],
               }}
            >
               <Button icon={<MoreOutlined />} className="aspect-square" />
            </Dropdown>
         </div>
      )
   }

   return (
      <>
         <Drawer
            title={
               <div className={"flex items-center justify-between"}>
                  <Button icon={<CloseOutlined className={"text-white"} />} type={"text"} onClick={props.onClose} />
                  <h1>Kiểm tra bảo hành</h1>
                  <Button icon={<MoreOutlined className={"text-white"} />} type={"text"} />
               </div>
            }
            closeIcon={false}
            height="100%"
            placement="bottom"
            footer={<Footer />}
            classNames={{ footer: "p-layout", header: "bg-head_maintenance text-white" }}
            {...props}
         >
            <Descriptions
               size={"small"}
               contentStyle={{
                  display: "flex",
                  justifyContent: "flex-end",
               }}
               colon={false}
               items={[
                  {
                     label: (
                        <div className="flex items-center gap-2">
                           <ChartDonut size={16} weight="duotone" />
                           <h2>Trạng thái</h2>
                        </div>
                     ),
                     children: hasFailedWarranty ? (
                        <div className="flex items-center gap-1 font-bold text-red-500">
                           <CloseOutlined />
                           Từ chối bảo hành
                        </div>
                     ) : (
                        <div className="flex items-center gap-1 font-bold text-green-500">
                           <CheckOutlined />
                           Đã bảo hành
                        </div>
                     ),
                  },
                  {
                     label: (
                        <div className="flex items-center gap-2">
                           <Clock size={16} weight="duotone" />
                           <h2>Thời gian máy về</h2>
                        </div>
                     ),
                     children: props.task?.completedAt ? dayjs(props.task.completedAt).format("HH:mm DD/MM/YYYY") : "-",
                  },
                  {
                     label: (
                        <div className="flex items-center gap-2">
                           <User size={16} weight="duotone" />
                           <h2>Nhân viên thực hiện</h2>
                        </div>
                     ),
                     children: (
                        <div className="flex items-center gap-1">
                           <Avatar size={18}>{props.task?.fixer?.username[0]}</Avatar>
                           {props.task?.fixer.username}
                        </div>
                     ),
                  },
                  {
                     label: (
                        <div className="flex items-center gap-2">
                           <Note size={16} weight="duotone" />
                           <h2>Ghi chú từ nhân viên</h2>
                        </div>
                     ),
                     children: props.task?.fixerNote || "Không có",
                  },
               ]}
            />
            <section className="mt-layout">
               <header className="mb-3">
                  <h2 className="text-base font-semibold">Quá trình bảo hành</h2>
                  <p className="font-base text-sm text-neutral-500">
                     {hasFailedWarranty
                        ? "Đơn bảo hành không được tiếp nhận. Vui lòng xem thông tin phía dưới."
                        : "Quá trình bảo hành diễn ra thành công."}
                  </p>
               </header>
               <main>
                  {warrantyIssues.send && warrantyIssues.receive && (
                     <div className="grid grid-cols-2 gap-4">
                        <section>
                           <div className="grid grid-cols-2 grid-rows-2 gap-2 rounded-lg border-[1px] border-neutral-300 p-2">
                              {warrantyIssues.send?.imagesVerify.map((img, index) => (
                                 <BackendImage
                                    src={img}
                                    key={`send_${img}_${index}`}
                                    className="aspect-square h-full w-full rounded-lg"
                                 />
                              ))}
                              {Array.from({ length: 4 - warrantyIssues.send?.imagesVerify.length }).map((_, index) => (
                                 <ClickableArea
                                    className="grid aspect-square h-full w-full place-items-center rounded-lg bg-gray-100 text-gray-300"
                                    key={`empty-imaage-send-${index}`}
                                 >
                                    <Images size={32} weight="duotone" />
                                 </ClickableArea>
                              ))}
                           </div>
                           <h3 className="mt-1 text-center text-sm font-medium">Biên nhận gửi máy</h3>
                        </section>
                        <section>
                           <div className="grid grid-cols-2 grid-rows-2 gap-2 rounded-lg border-[1px] border-neutral-300 p-2">
                              {(warrantyIssues.receive.status === IssueStatusEnum.RESOLVED
                                 ? warrantyIssues.receive.imagesVerify
                                 : warrantyIssues.receive.imagesVerifyFail
                              )?.map((img, index) => (
                                 <BackendImage
                                    src={img}
                                    key={`receive_${img}_${index}`}
                                    className="aspect-square h-full w-full rounded-lg"
                                 />
                              ))}
                              {Array.from({
                                 length:
                                    4 -
                                    (warrantyIssues.receive.status === IssueStatusEnum.RESOLVED
                                       ? warrantyIssues.receive.imagesVerify
                                       : warrantyIssues.receive.imagesVerifyFail
                                    ).length,
                              }).map((_, index) => (
                                 <ClickableArea
                                    className="grid aspect-square h-full w-full place-items-center rounded-lg bg-gray-100 text-gray-300"
                                    key={`empty-imaage-receive-${index}`}
                                 >
                                    <Images size={32} weight="duotone" />
                                 </ClickableArea>
                              ))}
                           </div>
                           <h3 className="mt-1 text-center text-sm font-medium">Biên nhận trả máy</h3>
                        </section>
                     </div>
                  )}
               </main>
            </section>
            <section className="mt-layout">
               <header className="mb-3">
                  <h2 className="text-base font-semibold">Quá trình lắp đặt</h2>
                  <p className="font-base text-sm text-neutral-500">Quá trính tháo và lắp đặt máy tại xưởng</p>
               </header>
               <main>
                  {warrantyIssues.disassemble && warrantyIssues.assemble && (
                     <div className="grid grid-cols-2 gap-4">
                        <section>
                           <div className="grid grid-cols-2 grid-rows-2 gap-2 rounded-lg border-[1px] border-neutral-300 p-2">
                              {warrantyIssues.disassemble?.imagesVerify
                                 .slice(1)
                                 .map((img, index) => (
                                    <BackendImage
                                       src={img}
                                       key={`disassemble_${img}_${index}`}
                                       className="aspect-square h-full w-full rounded-lg"
                                    />
                                 ))}
                              {Array.from({ length: 4 - warrantyIssues.disassemble?.imagesVerify.slice(1).length }).map(
                                 (_, index) => (
                                    <ClickableArea
                                       className="grid aspect-square h-full w-full place-items-center rounded-lg bg-gray-100 text-gray-300"
                                       key={`empty-imaage-disassemble-${index}`}
                                    >
                                       <Images size={32} weight="duotone" />
                                    </ClickableArea>
                                 ),
                              )}
                           </div>
                           <div className="mt-1">
                              <SignatureUploader signature={warrantyIssues.disassemble?.imagesVerify[0]} />
                           </div>
                           <h3 className="mt-1 text-center text-sm font-medium">Trước khi bảo hành</h3>
                        </section>
                        <section>
                           <div className="grid grid-cols-2 grid-rows-2 gap-2 rounded-lg border-[1px] border-neutral-300 p-2">
                              {warrantyIssues.assemble?.imagesVerify.map((img, index) => (
                                 <BackendImage
                                    src={img}
                                    key={`assemble_${img}_${index}`}
                                    className="aspect-square h-full w-full rounded-lg"
                                 />
                              ))}
                              {Array.from({ length: 4 - warrantyIssues.assemble?.imagesVerify.length }).map(
                                 (_, index) => (
                                    <ClickableArea
                                       className="grid aspect-square h-full w-full place-items-center rounded-lg bg-gray-100 text-gray-300"
                                       key={`empty-imaage-assemble-${index}`}
                                    >
                                       <Images size={32} weight="duotone" />
                                    </ClickableArea>
                                 ),
                              )}
                           </div>
                           <div className="mt-1">
                              <SignatureUploader signature={props.task?.imagesVerify[0]} />
                           </div>
                           <h3 className="mt-1 text-center text-sm font-medium">Sau khi bảo hành</h3>
                        </section>
                     </div>
                  )}
               </main>
            </section>
         </Drawer>
         <OverlayControllerWithRef ref={control_issueFailedResolveOptionsDrawer}>
            <IssueFailed_ResolveOptions
               showButtons={["fix", "renew"]}
               onChooseFix={() => {
                  const taskId = props.task?.id
                  if (!taskId || !props.request) return
                  control_requestApproveToFixDrawer.current?.handleOpen({
                     requestId: props.request.id,
                     onSuccess: () => {
                        mutate_completeTask.mutate(
                           {
                              id: taskId,
                           },
                           {
                              onSettled: () => {
                                 router.push(hm_uris.stack.requests_id_fix(props.request?.id ?? ""))
                              },
                           },
                        )
                     },
                  })
               }}
               onChooseWarranty={() => {
                  const taskId = props.task?.id
                  if (!taskId || !props.request) return
                  control_requestApproveToRenewDrawer.current?.handleOpen({
                     requestId: props.request.id,
                     onSuccess: () => {
                        mutate_completeTask.mutate(
                           {
                              id: taskId,
                           },
                           {
                              onSettled: () => {
                                 router.push(hm_uris.stack.requests_id_renew(props.request?.id ?? ""))
                              },
                           },
                        )
                     },
                  })
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_requestApproveToFixDrawer}>
            <Request_ApproveToFixDrawer isMultiple />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_requestApproveToRenewDrawer}>
            <Request_ApproveToRenewDrawer isMultiple />
         </OverlayControllerWithRef>
      </>
   )
}

export default Task_VerifyComplete_WarrantyDrawer
export type { Task_VerifyComplete_WarrantyDrawerProps }
