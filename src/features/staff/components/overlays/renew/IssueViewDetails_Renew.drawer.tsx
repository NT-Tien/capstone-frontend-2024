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
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import TaskUtil from "@/lib/domain/Task/Task.util"
import {
   BookOutlined,
   CheckOutlined,
   CloseOutlined,
   DownOutlined,
   MoreOutlined,
   UpOutlined,
   WarningOutlined,
} from "@ant-design/icons"
import { ChartDonut, Factory, FileText, ImageBroken, MapPin, SealWarning, Truck } from "@phosphor-icons/react"
import { App, Button, Card, Descriptions, Drawer, DrawerProps, Dropdown, Image, Segmented } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import Issue_Resolve_RemoveDrawer, { Issue_Resolve_RemoveDrawerProps } from "./Issue_Resolve_Remove.drawer"
import { NewDeviceInstallation, RemoveOldDeviceTypeErrorId } from "@/lib/constants/Renew"
import Issue_Resolve_InstallDrawer, { Issue_Resolve_InstallDrawerProps } from "./Issue_Resolve_Install.drawer"
import { ExportStatus } from "@/lib/domain/ExportWarehouse/ExportStatus.enum"
import QrCodeDisplayForRenewModal, { QrCodeDisplayForRenewModalRefType } from "./QrCodeDisplayForRenew.modal"

type IssueViewDetails_RenewDrawerProps = {
   issue?: IssueDto
   machineModel?: MachineModelDto
   request?: RequestDto
   task?: TaskDto
   refetchFn?: () => void
   isDisabled?: boolean
}
type Props = Omit<DrawerProps, "children"> &
   IssueViewDetails_RenewDrawerProps & {
      handleClose?: () => void
   }

function IssueViewDetails_RenewDrawer(props: Props) {
   const { modal, message } = App.useApp()
   const router = useRouter()

   const [showTypeErrorDescription, setShowTypeErrorDescription] = useState<boolean>(false)

   const control_issueFailDrawer = useRef<RefType<Issue_WarrantyFailedModalProps>>(null)
   const control_issueResolveRemoveDrawer = useRef<RefType<Issue_Resolve_RemoveDrawerProps>>(null)
   const control_issueResolveInstallDrawer = useRef<RefType<Issue_Resolve_InstallDrawerProps>>(null)
   const hasTakenRenewDevice = useMemo(() => TaskUtil.hasRenewDevice(props.task), [props.task])
   const control_qrCodeDisplayForRenewModal = useRef<QrCodeDisplayForRenewModalRefType | null>(null)

   const mutate_finishIssue = staff_mutations.issues.resolve()

   const renewDevice = useMemo(() => {
      if (!props.task?.device_renew) return

      const deviceArray = Array.isArray(props.task.device_renew) ? props.task.device_renew : [props.task.device_renew]
      const devices = deviceArray.filter((device) => device !== undefined)

      return devices.length > 0 ? devices[0] : undefined
   }, [props.task?.device_renew])

   useEffect(() => {
      if (!props.open) {
         setShowTypeErrorDescription(false)
      }
   }, [props.open])
   console.log("hasTakenRenewDevice: ",hasTakenRenewDevice);
   

   function Footer() {
      if (!props?.task) return null
      console.log("props.task.device_renew:", props.task?.device_renew)
      console.log("isArray:", hasTakenRenewDevice)
      console.log("renewDevice:", renewDevice)

      if (
         props.task.export_warehouse_ticket[0].status !== ExportStatus.EXPORTED
         // (props.task.confirmReceiptStaffSignature === "false" && props.task.confirmReceiptStockkeeperSignature === "false") ||
         // props.task.export_warehouse_ticket?.some(
         //    (ticket) => ticket.status === ExportStatus.ACCEPTED || ticket.status === ExportStatus.EXPORTED,
         // )
      ) {
         return (
            <div>
               <AlertCard text="Vui lòng lấy thiết bị mới ở kho." className="mb-layout" />
               <Button
                  block
                  type="primary"
                  size="large"
                  onClick={() =>
                     renewDevice && control_qrCodeDisplayForRenewModal.current?.handleOpen(props.task!.id, renewDevice)
                  }
               >
                  Lấy thiết bị
               </Button>
            </div>
         )
      }
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
                           case RemoveOldDeviceTypeErrorId: {
                              control_issueResolveRemoveDrawer.current?.handleOpen({
                                 issue: props.issue,
                                 requestId: props.request?.id,
                              })
                              return
                           }
                           case NewDeviceInstallation: {
                              control_issueResolveInstallDrawer.current?.handleOpen({
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
         {...props}
      >
         {props.issue && (
            <>
               <Descriptions
                  colon={false}
                  contentStyle={{
                     display: "flex",
                     justifyContent: "end",
                  }}
                  items={[
                     {
                        label: (
                           <div className={"flex items-center gap-1"}>
                              <SealWarning size={18} weight={"fill"} />
                              <span>Tên bước</span>
                           </div>
                        ),
                        children: (
                           <div className={"flex flex-col items-end text-right"}>
                              <div className={"font-bold"} onClick={() => setShowTypeErrorDescription((prev) => !prev)}>
                                 {props.issue.typeError.name}
                                 <button>
                                    {showTypeErrorDescription ? (
                                       <UpOutlined className={"ml-2 text-xs"} />
                                    ) : (
                                       <DownOutlined className={"ml-2 text-xs"} />
                                    )}
                                 </button>
                              </div>
                              {showTypeErrorDescription ? (
                                 <div className={"text-sm text-neutral-500"}>{props.issue.typeError.description}</div>
                              ) : (
                                 <div className={"w-48 truncate text-right text-sm text-neutral-500"}>
                                    {props.issue.typeError.description}
                                 </div>
                              )}
                           </div>
                        ),
                     },
                     {
                        label: (
                           <div className={"flex items-center gap-1"}>
                              <ChartDonut size={18} weight={"fill"} />
                              <span>Trạng thái</span>
                           </div>
                        ),
                        children: (
                           <div className={IssueStatusEnumTagMapper[props.issue.status].className}>
                              {IssueStatusEnumTagMapper[props.issue.status].text}
                           </div>
                        ),
                     },
                     {
                        label: (
                           <div className={"flex items-center gap-1"}>
                              <Factory size={18} weight={"fill"} />
                              <span>Nhà sản xuất</span>
                           </div>
                        ),
                        children: props.machineModel?.manufacturer,
                     },
                     {
                        label: (
                           <div className={"flex items-center gap-1"}>
                              <FileText size={18} weight={"fill"} />
                              <span>Thông tin đính kèm</span>
                           </div>
                        ),
                        children: props.issue.description || "-",
                     },
                     //  ...(props.issue.typeError.id === AssembleDeviceTypeErrorId
                     //     ? [
                     //          {
                     //             label: (
                     //                <div className={"flex items-center gap-1"}>
                     //                   <MapPin size={18} weight={"fill"} />
                     //                   <span>Vị trí lắp đặt</span>
                     //                </div>
                     //             ),
                     //             children: (
                     //                <div>
                     //                   {props.task?.device.area.name}{" "}
                     //                   {props.task?.device.positionX && props.task?.device.positionY
                     //                      ? `(${props.task?.device.positionX}, ${props.task?.device.positionY})`
                     //                      : ""}
                     //                </div>
                     //             ),
                     //          },
                     //       ]
                     //     : []),
                     //  {
                     //     label: (
                     //        <div className={"flex items-center gap-1"}>
                     //           <Truck size={18} weight={"fill"} />
                     //           <span>Điều khoản bảo hành</span>
                     //        </div>
                     //     ),
                     //     children: (
                     //        <Card
                     //           className={"mt-2 h-20 w-full border-[1px] border-orange-500 text-neutral-500"}
                     //           size={"small"}
                     //           onClick={() => {
                     //              modal.info({
                     //                 title: "Điều khoản bảo hành",
                     //                 content: <div>{props.machineModel?.description}</div>,
                     //                 centered: true,
                     //                 maskClosable: true,
                     //                 closable: true,
                     //                 footer: false,
                     //                 height: "90%",
                     //              })
                     //           }}
                     //        >
                     //           {props.machineModel?.description}
                     //        </Card>
                     //     ),
                     //     className: "*:flex-col",
                     //  },
                  ]}
               />
               {props.issue.status === IssueStatusEnum.FAILED && (
                  <Card
                     size={"small"}
                     className={"mt-layout bg-red-500 text-white"}
                     title={<div className="w-full text-center text-white">Lý do thất bại</div>}
                  >
                     {props.issue.failReason}
                  </Card>
               )}

               {props.issue.typeError.id === ReceiveWarrantyTypeErrorId && props.request && (
                  <SendWarrantyReceipt request={props.request} />
               )}
            </>
         )}
         {/* Fail issue */}
         <OverlayControllerWithRef ref={control_issueFailDrawer}>
            <Issue_WarrantyFailedModal
               onSuccess={() => {
                  router.push(staff_uri.navbar.tasks)
               }}
            />
         </OverlayControllerWithRef>
         {/* Resolve issue for disassemble warranty issue */}
         {/* <OverlayControllerWithRef ref={control_issueResolveDisassembleDrawer}>
            <Issue_Resolve_DisassembleDrawer
               onSuccess={() => {
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
            />
         </OverlayControllerWithRef> */}
         {/* Resolve issue for send warranty issue */}
         <OverlayControllerWithRef ref={control_issueResolveRemoveDrawer}>
            <Issue_Resolve_RemoveDrawer
               onSuccess={() => {
                  // finish tsk after sending warranty
                  mutate_finishIssue.mutate(
                     {
                        id: props.issue?.id ?? "",
                        payload: {
                           imagesVerify: props.issue?.imagesVerify ?? [],
                           videosVerify: props.issue?.videosVerify ?? "",
                        },
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
         <OverlayControllerWithRef ref={control_issueResolveInstallDrawer}>
            <Issue_Resolve_InstallDrawer
               onSuccess={() => {
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
            />
         </OverlayControllerWithRef>
         <QrCodeDisplayForRenewModal
            refetch={() => props.refetchFn}
            ref={control_qrCodeDisplayForRenewModal}
            title="Lấy máy mới"
            description="Hãy xuống kho và đưa mã này cho thủ kho"
            onComplete={() => {}}
         />
         {/* Resolve issue for assemble warranty issue */}
         {/* <OverlayControllerWithRef ref={control_issueResolveAssembleDrawer}>
            <Issue_Resolve_AssembleDrawer
               onSuccess={() => {
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
            />
         </OverlayControllerWithRef> */}
      </Drawer>
   )
}

function SendWarrantyReceipt(props: { request: RequestDto }) {
   const sendWarrantyTask = props.request.tasks.find((task) => TaskUtil.isTask_Warranty(task, "send"))

   if (!sendWarrantyTask) return null

   const sendWarrantyIssue = sendWarrantyTask.issues.find((issue) => issue.typeError.id === SendWarrantyTypeErrorId)

   if (!sendWarrantyIssue) return null

   return (
      <section className="mt-layout">
         <header className="">
            <h3 className="text-base font-semibold">Biên nhận bảo hành</h3>
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
               // eslint-disable-next-line react/jsx-key
               <div className="grid aspect-square w-full place-items-center rounded-lg border-[2px] border-dashed border-gray-300 text-gray-300">
                  <ImageBroken size={24} />
               </div>
            ))}
         </div>
      </section>
   )
}

export default IssueViewDetails_RenewDrawer
export type { IssueViewDetails_RenewDrawerProps }
