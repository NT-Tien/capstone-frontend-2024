"use client"

import AlertCard from "@/components/AlertCard"
import BackendImage from "@/components/BackendImage"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { clientEnv } from "@/env"
import IssueFailDrawer, { IssueFailDrawerProps } from "@/features/staff/components/overlays/Issue_Fail.drawer"
import ResolveIssueDrawer, { ResolveIssueDrawerProps } from "@/features/staff/components/overlays/ResolveIssue.drawer"
import Issue_Resolve_AssembleDrawer, {
   Issue_Resolve_AssembleDrawerProps,
} from "@/features/staff/components/overlays/warranty/Issue_Resolve_Assemble.drawer"
import Issue_Resolve_DisassembleDrawer, {
   Issue_Resolve_DisassembleDrawerProps,
} from "@/features/staff/components/overlays/warranty/Issue_Resolve_Disassemble.drawer"
import Issue_Resolve_ReceiveDrawer, {
   Issue_Resolve_ReceiveDrawerProps,
} from "@/features/staff/components/overlays/warranty/Issue_Resolve_Receive.drawer"
import Issue_Resolve_SendDrawer, {
   Issue_Resolve_SendDrawerProps,
} from "@/features/staff/components/overlays/warranty/Issue_Resolve_Send.drawer"
import Issue_WarrantyFailedModal, {
   Issue_WarrantyFailedModalProps,
} from "@/features/staff/components/overlays/warranty/Issue_WarrantyFailed.modal"
import staff_mutations from "@/features/staff/mutations"
import staff_uri from "@/features/staff/uri"
import {
   AssembleDeviceTypeErrorId,
   DisassembleDeviceTypeErrorId,
   ReceiveWarrantyTypeErrorId,
   SendWarrantyTypeErrorId,
} from "@/lib/constants/Warranty"
import { WarrantyFailedReasonsList } from "@/lib/constants/WarrantyFailedReasons"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { cn } from "@/lib/utils/cn.util"
import {
   BookOutlined,
   CheckOutlined,
   CloseOutlined,
   DownOutlined,
   MoreOutlined,
   UpOutlined,
   WarningOutlined,
} from "@ant-design/icons"
import {
   ChartDonut,
   Factory,
   FileDoc,
   FileText,
   Gavel,
   ImageBroken,
   MapPin,
   Note,
   SealWarning,
   Truck,
   XCircle,
} from "@phosphor-icons/react"
import { App, Button, Card, Descriptions, Divider, Drawer, DrawerProps, Dropdown, Image, Segmented } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

type IssueViewDetails_WarrantyDrawerProps = {
   issue?: IssueDto
   machineModel?: MachineModelDto
   request?: RequestDto
   task?: TaskDto
   refetchFn?: () => void
   isDisabled?: boolean
}
type Props = Omit<DrawerProps, "children"> &
   IssueViewDetails_WarrantyDrawerProps & {
      handleClose?: () => void
   }

function IssueViewDetails_WarrantyDrawer(props: Props) {
   const { modal } = App.useApp()
   const router = useRouter()

   const [showTypeErrorDescription, setShowTypeErrorDescription] = useState<boolean>(false)

   const control_issueFailDrawer = useRef<RefType<Issue_WarrantyFailedModalProps>>(null)
   const control_issueResolveAssembleDrawer = useRef<RefType<Issue_Resolve_AssembleDrawerProps>>(null)
   const control_issueResolveDisassembleDrawer = useRef<RefType<Issue_Resolve_DisassembleDrawerProps>>(null)
   const control_issueResolveSendDrawer = useRef<RefType<Issue_Resolve_SendDrawerProps>>(null)
   const control_issueResolveReceiveDrawer = useRef<RefType<Issue_Resolve_ReceiveDrawerProps>>(null)

   const mutate_finishTaskWarrantySend = staff_mutations.task.finishWarrantySend()

   useEffect(() => {
      if (!props.open) {
         setShowTypeErrorDescription(false)
      }
   }, [props.open])

   function Footer() {
      if (props.issue?.status === IssueStatusEnum.PENDING) {
         return (
            <div className={"flex flex-col"}>
               {props.isDisabled && (
                  <AlertCard text={"Vui lòng hoàn thành bước trước đó"} type={"info"} className={"mb-4"} />
               )}
               <div className={"flex items-center gap-2"}>
                  <Button
                     block
                     type={"primary"}
                     size={"large"}
                     onClick={() => {
                        if (!props.issue) return

                        switch (props.issue.typeError.id) {
                           case DisassembleDeviceTypeErrorId: {
                              control_issueResolveDisassembleDrawer.current?.handleOpen({
                                 issue: props.issue,
                              })
                              return
                           }
                           case SendWarrantyTypeErrorId: {
                              control_issueResolveSendDrawer.current?.handleOpen({
                                 issue: props.issue,
                                 requestId: props.request?.id,
                              })
                              return
                           }
                           case ReceiveWarrantyTypeErrorId: {
                              control_issueResolveReceiveDrawer.current?.handleOpen({
                                 issue: props.issue,
                              })
                              return
                           }
                           case AssembleDeviceTypeErrorId: {
                              control_issueResolveAssembleDrawer.current?.handleOpen({
                                 issue: props.issue,
                              })
                              return
                           }
                        }
                     }}
                     icon={<CheckOutlined />}
                     disabled={props.isDisabled}
                  >
                     Hoàn thành
                  </Button>
                  {(props.issue.typeError.id === SendWarrantyTypeErrorId ||
                     props.issue.typeError.id === ReceiveWarrantyTypeErrorId) && (
                     <Dropdown
                        menu={{
                           items: [
                              {
                                 label: "Không hoàn thành được bước",
                                 key: "cancel-issue",
                                 danger: true,
                                 icon: <WarningOutlined />,
                                 disabled: props.isDisabled,
                                 onClick: () =>
                                    props.issue &&
                                    props.task &&
                                    control_issueFailDrawer.current?.handleOpen({
                                       issueDto: props.issue,
                                       taskId: props.task.id,
                                    }),
                              },
                           ],
                        }}
                     >
                        <Button size={"large"} icon={<MoreOutlined />} className={"aspect-square"} />
                     </Dropdown>
                  )}
               </div>
            </div>
         )
      }
   }

   return (
      <Drawer
         title={
            <div className={"flex items-center justify-between"}>
               <Button icon={<CloseOutlined className={"text-white"} />} type={"text"} onClick={props.onClose} />
               <h1>Thông tin bước</h1>
               <Button icon={<MoreOutlined className={"text-white"} />} type={"text"} />
            </div>
         }
         classNames={{
            header: "bg-staff text-white",
            footer: "p-layout",
         }}
         closeIcon={false}
         placement={"bottom"}
         height="85%"
         loading={!props.issue}
         footer={<Footer />}
         push={false}
         {...props}
      >
         {props.issue && (
            <>
               <div className="text-base">
                  <section className="pb-3">
                     <div className="flex">
                        <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                           <SealWarning size={16} weight={"fill"} />
                           {props.issue.typeError.name}
                        </h2>
                        <div className={cn(IssueStatusEnumTagMapper[props.issue.status].className, "text-sm")}>
                           {IssueStatusEnumTagMapper[props.issue.status].text}
                        </div>
                     </div>
                     <p className="text-sm text-neutral-500">{props.issue.typeError.description}</p>
                  </section>
                  <Divider className="m-0" />
                  <section className="flex py-3">
                     <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                        <Factory size={16} weight={"fill"} />
                        Nhà sản xuất
                     </h2>
                     <p className="text-sm text-neutral-500">{props.machineModel?.manufacturer}</p>
                  </section>
                  {props.issue.typeError.id === AssembleDeviceTypeErrorId && (
                     <>
                        <Divider className="m-0" />
                        <section className="flex py-3">
                           <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                              <MapPin size={16} weight={"fill"} />
                              Vị trí lắp đặt
                           </h2>
                           <p className="text-sm text-neutral-500">
                              {props.task?.device?.area?.name}{" "}
                              {props.task?.device.positionX && props.task?.device.positionY
                                 ? `(${props.task?.device.positionX}, ${props.task?.device.positionY})`
                                 : ""}
                           </p>
                        </section>
                     </>
                  )}
                  {props.issue.description && (
                     <>
                        <Divider className="m-0" />
                        <section className="py-3">
                           <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                              <Note size={16} weight={"fill"} />
                              Thông tin đính kèm
                           </h2>
                           <p className="text-sm text-neutral-500">{props.issue.description}</p>
                        </section>
                     </>
                  )}
                  <Divider className="m-0" />
                  <section className="flex flex-col py-3">
                     <h3 className="flex items-center gap-1.5 font-medium">
                        <Gavel size={16} weight="fill" />
                        Điều khoản bảo hành
                     </h3>
                     <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                        {props.task?.device.machineModel.description}
                     </p>
                     <a
                        className="mt-1 text-sm font-medium text-black underline underline-offset-2"
                        onClick={() => {
                           modal.info({
                              title: "Điều khoản bảo hành",
                              content: <div>{props.task?.device.machineModel.description}</div>,
                              centered: true,
                              maskClosable: true,
                              closable: true,
                              footer: false,
                              height: "90%",
                           })
                        }}
                     >
                        Xem thêm
                     </a>
                  </section>
               </div>
               {props.issue.status === IssueStatusEnum.FAILED && (
                  <section>
                     <h3 className="flex items-center gap-1.5 font-medium text-red-500">
                        <XCircle size={16} weight="fill" />
                        Lý do thất bại
                     </h3>
                     <p className="text-sm text-red-400">{props.issue.failReason}</p>
                  </section>
                  // <Card
                  //    size={"small"}
                  //    className={"mt-layout bg-red-500 text-white"}
                  //    title={<div className="w-full text-center text-white">Lý do thất bại</div>}
                  // >
                  //    {props.issue.failReason}
                  // </Card>
               )}

               {props.issue.typeError.id === ReceiveWarrantyTypeErrorId && props.request && (
                  <>
                     <Divider className="m-0" />
                     <SendWarrantyReceipt className="py-3" request={props.request} />
                  </>
               )}
            </>
         )}
         {/* Fail issue */}
         <OverlayControllerWithRef ref={control_issueFailDrawer}>
            <Issue_WarrantyFailedModal
               onSuccess={(values) => {
                  if (values.selectedReason === WarrantyFailedReasonsList.WARRANTY_REJECTED_AFTER_PROCESS) {
                     props.refetchFn?.()
                     router.push(staff_uri.navbar.tasks)
                  } else {
                     router.push(staff_uri.navbar.tasks)
                  }
               }}
            />
         </OverlayControllerWithRef>
         {/* Resolve issue for disassemble warranty issue */}
         <OverlayControllerWithRef ref={control_issueResolveDisassembleDrawer}>
            <Issue_Resolve_DisassembleDrawer
               onSuccess={() => {
                  router.push(staff_uri.navbar.tasks)
               }}
            />
         </OverlayControllerWithRef>
         {/* Resolve issue for send warranty issue */}
         <OverlayControllerWithRef ref={control_issueResolveSendDrawer}>
            <Issue_Resolve_SendDrawer
               onSuccess={() => {
                  // finish tsk after sending warranty
                  mutate_finishTaskWarrantySend.mutate(
                     {
                        id: props.task?.id ?? "",
                     },
                     {
                        onSuccess: () => {
                           router.push(staff_uri.navbar.tasks)
                        },
                     },
                  )
               }}
            />
         </OverlayControllerWithRef>
         {/* Resolve issue for receive warranty issue */}
         <OverlayControllerWithRef ref={control_issueResolveReceiveDrawer}>
            <Issue_Resolve_ReceiveDrawer
               onSuccess={() => {
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
            />
         </OverlayControllerWithRef>
         {/* Resolve issue for assemble warranty issue */}
         <OverlayControllerWithRef ref={control_issueResolveAssembleDrawer}>
            <Issue_Resolve_AssembleDrawer
               onSuccess={() => {
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
            />
         </OverlayControllerWithRef>
      </Drawer>
   )
}

function SendWarrantyReceipt(props: { request: RequestDto; className?: string }) {
   const sendWarrantyTask = props.request.tasks.find((task) => TaskUtil.isTask_Warranty(task, "send", true))

   if (!sendWarrantyTask) return null

   const sendWarrantyIssue = sendWarrantyTask.issues.find((issue) => issue.typeError.id === SendWarrantyTypeErrorId)

   if (!sendWarrantyIssue) return null

   return (
      <section className={props.className}>
         <header className="">
            <h3 className="flex items-center gap-1.5 text-base font-semibold">
               <FileDoc size={16} weight="fill" />
               Biên nhận bảo hành
            </h3>
            <p className="font-base text-sm text-neutral-500">Thông tin biên nhận sau khi gửi bảo hành</p>
         </header>
         <div className="mt-2 grid grid-cols-4 gap-3">
            {sendWarrantyIssue.imagesVerify.map((img, index) => (
               <BackendImage
                  key={img + index + "_image"}
                  src={img}
                  alt={`image_${index}`}
                  className="aspect-square w-full rounded-lg"
               />
            ))}
            {new Array(4 - sendWarrantyIssue.imagesVerify.length).fill(0).map((_, index) => (
               <div
                  className="grid aspect-square w-full place-items-center rounded-lg border-[2px] border-dashed border-gray-300 text-gray-300"
                  key={`empty_image_${index}`}
               >
                  <ImageBroken size={24} />
               </div>
            ))}
         </div>
      </section>
   )
}

export default IssueViewDetails_WarrantyDrawer
export type { IssueViewDetails_WarrantyDrawerProps }
