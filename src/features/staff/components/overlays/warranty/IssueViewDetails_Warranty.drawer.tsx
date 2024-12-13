"use client"

import AlertCard from "@/components/AlertCard"
import BackendImage from "@/components/BackendImage"
import ImageUploader from "@/components/ImageUploader"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import VideoUploader from "@/components/VideoUploader"
import Issue_Resolve_AssembleDrawer, {
   Issue_Resolve_AssembleDrawerProps,
} from "@/features/staff/components/overlays/warranty/Issue_Resolve_Assemble.drawer"
import Issue_Resolve_DisassembleDrawer, {
   Issue_Resolve_DisassembleDrawerProps,
} from "@/features/staff/components/overlays/warranty/Issue_Resolve_Disassemble.drawer"
import Issue_Resolve_DisassembleReplacementDrawer, {
   Issue_Resolve_DisassembleReplacementDrawerProps,
} from "@/features/staff/components/overlays/warranty/Issue_Resolve_DisassembleReplacement.drawer"
import Issue_Resolve_InstallReplacementDrawer, {
   Issue_Resolve_InstallReplacementDrawerProps,
} from "@/features/staff/components/overlays/warranty/Issue_Resolve_InstallReplacement.drawer"
import Issue_Resolve_ReceiveDrawer, {
   Issue_Resolve_ReceiveDrawerProps,
} from "@/features/staff/components/overlays/warranty/Issue_Resolve_Receive.drawer"
import Issue_Resolve_ReturnWarehouseDrawer, {
   Issue_Resolve_ReturnWarehouseDrawerProps,
} from "@/features/staff/components/overlays/warranty/Issue_Resolve_ReturnWarehouse.drawer"
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
   DismantleReplacementDeviceTypeErrorId,
   InstallReplacementDeviceTypeErrorId,
   ReceiveWarrantyTypeErrorId,
   ReturnToWarehouseTypeErrorId,
   SendWarrantyTypeErrorId,
} from "@/lib/constants/Warranty"
import { WarrantyFailedReasonsList } from "@/lib/constants/WarrantyFailedReasons"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import RequestUtil from "@/lib/domain/Request/Request.util"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { cn } from "@/lib/utils/cn.util"
import { CheckOutlined, CloseOutlined, MoreOutlined, RightOutlined, WarningOutlined } from "@ant-design/icons"
import {
   Factory,
   File,
   FileDoc,
   Gavel,
   Gear,
   House,
   IdentificationCard,
   ImageBroken,
   Laptop,
   MapPin,
   Phone,
   SealWarning,
   XCircle,
} from "@phosphor-icons/react"
import { App, Button, Card, Divider, Drawer, DrawerProps, Dropdown, QRCode, Space } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

type IssueViewDetails_WarrantyDrawerProps = {
   issue?: IssueDto
   machineModel?: MachineModelDto
   request?: RequestDto
   task?: TaskDto
   refetchFn?: () => void
   isDisabled?: boolean
   autoOpenComplete?: () => void
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
   const control_issueResolveInstallReplacementDrawer =
      useRef<RefType<Issue_Resolve_InstallReplacementDrawerProps>>(null)
   const control_issueResolveDisassembleDrawer = useRef<RefType<Issue_Resolve_DisassembleDrawerProps>>(null)
   const control_issueResolveSendDrawer = useRef<RefType<Issue_Resolve_SendDrawerProps>>(null)
   const control_issueResolveDisassembleReplacementDrawer =
      useRef<RefType<Issue_Resolve_DisassembleReplacementDrawerProps>>(null)
   const control_issueResolveReceiveDrawer = useRef<RefType<Issue_Resolve_ReceiveDrawerProps>>(null)
   const control_issueResolveRetunWarehouse = useRef<RefType<Issue_Resolve_ReturnWarehouseDrawerProps>>(null)

   const mutate_finishTaskWarrantySend = staff_mutations.task.finishWarrantySend()
   const mutate_resolveWarrantyReceive = staff_mutations.issues.resolveReceiveWarranty()

   const warrantyCard = useMemo(() => {
      return RequestUtil.getCurrentWarrantyCard(props.request)
   }, [props.request])

   useEffect(() => {
      if (!props.open) {
         setShowTypeErrorDescription(false)
      }
   }, [props.open])

   function Footer() {
      if (props.isDisabled) {
         return <AlertCard text={"Vui lòng hoàn thành bước trước đó"} type={"info"} />
      }
      if (props.issue?.status === IssueStatusEnum.PENDING) {
         return (
            <div className={"flex items-center gap-2"}>
               <Button
                  block
                  type={props.issue.typeError.id === ReturnToWarehouseTypeErrorId ? "default" : "primary"}
                  onClick={() => {
                     if (!props.issue) return

                     switch (props.issue.typeError.id) {
                        case DisassembleDeviceTypeErrorId: {
                           control_issueResolveDisassembleDrawer.current?.handleOpen({
                              issue: props.issue,
                           })
                           return
                        }
                        case InstallReplacementDeviceTypeErrorId: {
                           control_issueResolveInstallReplacementDrawer.current?.handleOpen({
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
                        case DismantleReplacementDeviceTypeErrorId: {
                           control_issueResolveDisassembleReplacementDrawer.current?.handleOpen({
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
                        case ReturnToWarehouseTypeErrorId: {
                           props.refetchFn?.()
                           props.handleClose?.()
                        }
                     }
                  }}
                  icon={props.issue.typeError.id === ReturnToWarehouseTypeErrorId ? undefined : <CheckOutlined />}
                  disabled={props.isDisabled}
               >
                  {props.issue.typeError.id === ReturnToWarehouseTypeErrorId ? "Đóng" : "Hoàn thành bước"}
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
                     <Button icon={<MoreOutlined />} className={"aspect-square"} />
                  </Dropdown>
               )}
            </div>
         )
      }
   }

   return (
      <Drawer
         title={
            <div className="flex flex-col items-center rounded-full">
               <div className="h-1 w-1/2 bg-neutral-300" />
               <section className="mt-3 text-center">
                  <h1 className="text-lg font-bold">{props.issue?.typeError.name ?? "-"}</h1>
                  <p className="text-sm font-light text-neutral-500">{props.issue?.typeError.description ?? "-"}</p>
               </section>
            </div>
         }
         classNames={{
            header: "border-none pb-2",
            footer: "p-layout",
            body: "pt-0",
            wrapper: "rounded-t-xl",
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
                  <div className="flex w-full flex-col gap-0">
                     {props.issue.typeError.id === DisassembleDeviceTypeErrorId && (
                        <>
                           <section className="flex py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <MapPin size={16} weight={"fill"} />
                                 Vị trí thiết bị
                              </h2>
                              <p className="text-sm text-neutral-500">
                                 {props.request?.area.name} ({props.request?.old_device.positionX},{" "}
                                 {props.request?.old_device.positionY})
                              </p>
                           </section>
                           <section className="flex flex-col py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <Laptop size={16} weight={"fill"} />
                                 Thiết bị cần tháo
                              </h2>
                              <Card size={"small"} className="mt-3 w-full bg-[#FF6B00] text-white">
                                 <div className={"flex items-center gap-2"}>
                                    <div className={"flex-grow"}>
                                       <Space
                                          className={"text-xs"}
                                          split={<Divider type={"vertical"} className={"m-0"} />}
                                       >
                                          <span>{warrantyCard?.device?.deviceCode}</span>
                                          <span>
                                             {warrantyCard?.device?.machineModel.manufacturer}{" "}
                                             {warrantyCard?.device?.machineModel.yearOfProduction}
                                          </span>
                                       </Space>
                                       <h3 className={"line-clamp-2 text-base font-semibold"}>
                                          {warrantyCard?.device?.machineModel.name}
                                       </h3>
                                    </div>
                                    <div>
                                       <Gear size={32} weight={"fill"} />
                                    </div>
                                 </div>
                              </Card>
                           </section>
                           <section className="flex py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <File size={16} weight={"fill"} />
                                 Hướng dẫn tháo rời
                              </h2>
                              <p className="text-sm text-neutral-500">Không có</p>
                           </section>
                           <section className="flex flex-col py-2">
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
                        </>
                     )}
                     {props.issue.typeError.id === SendWarrantyTypeErrorId && (
                        <>
                           <section className="flex py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <Factory size={16} weight={"fill"} />
                                 Nhà sản xuất
                              </h2>
                              <p className="text-sm text-neutral-500">{props.machineModel?.manufacturer}</p>
                           </section>
                           <section className="flex flex-col py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <MapPin size={16} weight={"fill"} />
                                 Lỗi thiết bị được báo cáo
                              </h2>
                              <div className="mt-2">
                                 <section className="mb-1 text-sm text-neutral-500">
                                    Mô tả: {warrantyCard?.initial_note}
                                 </section>
                                 {warrantyCard?.initial_images && (
                                    <section className="mb-1 text-sm text-neutral-500">
                                       <h3 className="mb-1">Hình ảnh:</h3>
                                       <ImageUploader value={warrantyCard.initial_images} />
                                    </section>
                                 )}
                                 {warrantyCard?.initial_video && (
                                    <section className="mb-1 text-sm text-neutral-500">
                                       <h3 className="mb-1">Video:</h3>
                                       <VideoUploader value={[warrantyCard.initial_video]} />
                                    </section>
                                 )}
                              </div>
                           </section>
                           <section className="flex flex-col py-2">
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
                        </>
                     )}
                     {props.issue.typeError.id === ReceiveWarrantyTypeErrorId && (
                        <>
                           <section className="flex py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <IdentificationCard size={16} weight={"fill"} />
                                 Mã đơn bảo hành
                              </h2>
                              <p className="text-sm text-neutral-500">{warrantyCard?.code}</p>
                           </section>
                           <section className="flex flex-col py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <House size={16} weight={"fill"} />
                                 Tên trung tâm bảo hành
                              </h2>
                              <p className="text-sm text-neutral-500">{warrantyCard?.wc_name}</p>
                           </section>
                           <section className="flex flex-col py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <MapPin size={16} weight={"fill"} />
                                 Địa chỉ trung tâm bảo hành
                              </h2>
                              <p className="text-sm text-neutral-500">
                                 {warrantyCard?.wc_address_1}, {warrantyCard?.wc_address_2}, Phường{" "}
                                 {warrantyCard?.wc_address_ward}, Quận {warrantyCard?.wc_address_district},{" "}
                                 {warrantyCard?.wc_address_city}
                              </p>
                           </section>
                           <section className="flex py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <Phone size={16} weight={"fill"} />
                                 Số điện thoại
                              </h2>
                              <p className="text-sm text-neutral-500">{warrantyCard?.wc_receiverPhone}</p>
                           </section>
                           <section className="flex flex-col py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <Laptop size={16} weight={"fill"} />
                                 Thiết bị cần nhận
                              </h2>
                              <Card size={"small"} className="mt-3 w-full bg-[#FF6B00] text-white">
                                 <div className={"flex items-center gap-2"}>
                                    <div className={"flex-grow"}>
                                       <Space
                                          className={"text-xs"}
                                          split={<Divider type={"vertical"} className={"m-0"} />}
                                       >
                                          <span>{warrantyCard?.device.deviceCode}</span>
                                          <span>
                                             {warrantyCard?.device.machineModel.manufacturer}{" "}
                                             {warrantyCard?.device.machineModel.yearOfProduction}
                                          </span>
                                       </Space>
                                       <h3 className={"line-clamp-2 text-base font-semibold"}>
                                          {warrantyCard?.device.machineModel.name}
                                       </h3>
                                    </div>
                                    <div>
                                       <Gear size={32} weight={"fill"} />
                                    </div>
                                 </div>
                              </Card>
                           </section>
                        </>
                     )}
                     {props.issue.typeError.id === DismantleReplacementDeviceTypeErrorId && (
                        <>
                           <section className="flex w-full justify-between py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <MapPin size={16} weight={"fill"} />
                                 Vị trí thiết bị
                              </h2>
                              <p className="text-sm text-neutral-500">
                                 {props.request?.area?.name} ({props.request?.old_device.positionX},{" "}
                                 {props.request?.old_device.positionY})
                              </p>
                           </section>
                           <section className="flex py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <File size={16} weight={"fill"} />
                                 Hướng dẫn tháo rời
                              </h2>
                              <p className="text-sm text-neutral-500">Không có</p>
                           </section>
                           <section className="flex flex-col py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <Laptop size={16} weight={"fill"} />
                                 Thiết bị cần lắp đặt
                              </h2>
                              <Card size={"small"} className="mt-3 w-full bg-[#FF6B00] text-white">
                                 <div className={"flex items-center gap-2"}>
                                    <div className={"flex-grow"}>
                                       <Space
                                          className={"text-xs"}
                                          split={<Divider type={"vertical"} className={"m-0"} />}
                                       >
                                          <span>{props.request?.temporary_replacement_device?.deviceCode}</span>
                                          <span>
                                             {props.request?.temporary_replacement_device?.machineModel.manufacturer}{" "}
                                             {
                                                props.request?.temporary_replacement_device?.machineModel
                                                   .yearOfProduction
                                             }
                                          </span>
                                       </Space>
                                       <h3 className={"line-clamp-2 text-base font-semibold"}>
                                          {props.request?.temporary_replacement_device?.machineModel.name}
                                       </h3>
                                    </div>
                                    <div>
                                       <Gear size={32} weight={"fill"} />
                                    </div>
                                 </div>
                              </Card>
                           </section>
                        </>
                     )}
                     {props.issue.typeError.id === AssembleDeviceTypeErrorId && (
                        <>
                           <section className="flex w-full justify-between py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <MapPin size={16} weight={"fill"} />
                                 Vị trí lắp đặt
                              </h2>
                              <p className="text-sm text-neutral-500">
                                 {props.request?.area?.name} ({props.request?.old_device.positionX},{" "}
                                 {props.request?.old_device.positionY})
                              </p>
                           </section>
                           <section className="flex py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <File size={16} weight={"fill"} />
                                 Hướng dẫn lắp đặt
                              </h2>
                              <p className="text-sm text-neutral-500">Không có</p>
                           </section>
                           <section className="flex flex-col py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <Laptop size={16} weight={"fill"} />
                                 Thiết bị cần lắp
                              </h2>
                              <Card size={"small"} className="mt-3 w-full bg-[#FF6B00] text-white">
                                 <div className={"flex items-center gap-2"}>
                                    <div className={"flex-grow"}>
                                       <Space
                                          className={"text-xs"}
                                          split={<Divider type={"vertical"} className={"m-0"} />}
                                       >
                                          <span>{warrantyCard?.device.deviceCode}</span>
                                          <span>
                                             {warrantyCard?.device.machineModel.manufacturer}{" "}
                                             {warrantyCard?.device.machineModel.yearOfProduction}
                                          </span>
                                       </Space>
                                       <h3 className={"line-clamp-2 text-base font-semibold"}>
                                          {warrantyCard?.device.machineModel.name}
                                       </h3>
                                    </div>
                                    <div>
                                       <Gear size={32} weight={"fill"} />
                                    </div>
                                 </div>
                              </Card>
                           </section>
                        </>
                     )}
                     {props.issue.typeError.id === InstallReplacementDeviceTypeErrorId && (
                        <>
                           <section className="flex w-full justify-between py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <MapPin size={16} weight={"fill"} />
                                 Vị trí lắp đặt
                              </h2>
                              <p className="text-sm text-neutral-500">
                                 {props.request?.area?.name} ({props.request?.old_device.positionX},{" "}
                                 {props.request?.old_device.positionY})
                              </p>
                           </section>
                           <section className="flex py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <File size={16} weight={"fill"} />
                                 Hướng dẫn lắp đặt
                              </h2>
                              <p className="text-sm text-neutral-500">Không có</p>
                           </section>
                           <section className="flex flex-col py-2">
                              <h2 className="mr-auto flex items-center gap-1.5 font-medium">
                                 <Laptop size={16} weight={"fill"} />
                                 Thiết bị cần lắp đặt
                              </h2>
                              <Card size={"small"} className="mt-3 w-full bg-[#FF6B00] text-white">
                                 <div className={"flex items-center gap-2"}>
                                    <div className={"flex-grow"}>
                                       <Space
                                          className={"text-xs"}
                                          split={<Divider type={"vertical"} className={"m-0"} />}
                                       >
                                          <span>{props.request?.temporary_replacement_device?.deviceCode}</span>
                                          <span>
                                             {props.request?.temporary_replacement_device?.machineModel.manufacturer}{" "}
                                             {
                                                props.request?.temporary_replacement_device?.machineModel
                                                   .yearOfProduction
                                             }
                                          </span>
                                       </Space>
                                       <h3 className={"line-clamp-2 text-base font-semibold"}>
                                          {props.request?.temporary_replacement_device?.machineModel.name}
                                       </h3>
                                    </div>
                                    <div>
                                       <Gear size={32} weight={"fill"} />
                                    </div>
                                 </div>
                              </Card>
                           </section>
                        </>
                     )}
                  </div>
                  {props.issue.typeError.id === ReturnToWarehouseTypeErrorId &&
                     props.issue.status === IssueStatusEnum.PENDING && (
                        <>
                           <AlertCard text={"Vui lòng đưa mã QR cho thủ kho"} type={"info"} className="mb-1 p-3" />
                           <div className="aspect-square h-full w-full">
                              <QRCode
                                 value={props.task?.id ?? ""}
                                 className="h-full w-full"
                                 onClick={() => {
                                    navigator.clipboard.writeText(props.task?.id ?? "")
                                 }}
                              />
                           </div>
                        </>
                     )}
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
                     <SendWarrantyReceipt className="py-2" request={props.request} />
                  </>
               )}
            </>
         )}
         {/* Fail issue */}
         <OverlayControllerWithRef ref={control_issueFailDrawer}>
            <Issue_WarrantyFailedModal
               onSuccess={(values) => {
                  if (values.selectedReason === WarrantyFailedReasonsList.WARRANTY_REJECTED_ON_ARRIVAL) {
                     modal.info({
                        closable: false,
                        maskClosable: false,
                        title: "Thông báo",
                        content: `Vui lòng về nhà kho của xưởng để tiếp tục tác vụ`,
                        onOk: () => {
                           router.push(staff_uri.navbar.dashboard)
                        },
                        centered: true,
                        okText: "Quay về trang chủ",
                        okButtonProps: {
                           icon: <RightOutlined />,
                        },
                     })
                  }
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
                  modal.info({
                     closable: false,
                     maskClosable: false,
                     title: "Thông báo",
                     type: "success",
                     content: `Vui lòng đi đến một trung tâm bảo hành ${props.machineModel?.manufacturer} để tiếp tục tác vụ.`,
                     onOk: () => {
                        router.push(staff_uri.navbar.dashboard)
                     },
                     centered: true,
                     okText: "Quay về trang chủ",
                     okButtonProps: {
                        icon: <RightOutlined />,
                     },
                  })
               }}
            />
         </OverlayControllerWithRef>
         {/* Resolve issue for install replacement device */}
         <OverlayControllerWithRef ref={control_issueResolveInstallReplacementDrawer}>
            <Issue_Resolve_InstallReplacementDrawer
               onSuccess={() => {
                  router.push(staff_uri.navbar.tasks)
               }}
            />
         </OverlayControllerWithRef>
         {/* Resolve issue for send warranty issue */}
         <OverlayControllerWithRef ref={control_issueResolveSendDrawer}>
            <Issue_Resolve_SendDrawer
               onSuccess={(values) => {
                  // finish tsk after sending warranty
                  mutate_finishTaskWarrantySend.mutate(
                     {
                        id: props.task?.id ?? "",
                        payload: {
                           code: values.warrantyCenter_id,
                           receive_date: values.warrantyCenter_expectedReturn!.toISOString(),
                           send_date: dayjs().toISOString(),
                           wc_receiverName: values.warrantyCenter_receiverName,
                           wc_receiverPhone: values.warrantyCenter_receiverPhone,
                           wc_address_1: values.street1,
                           wc_address_2: values.street2,
                           wc_address_city: values.city,
                           wc_address_district: values.district,
                           wc_address_ward: values.ward,
                           wc_name: values.name,
                           send_note: values.warrantyCenter_note,
                           send_bill_image: values.receipt_images,
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
         <OverlayControllerWithRef ref={control_issueResolveReceiveDrawer}>
            <Issue_Resolve_ReceiveDrawer
               onSuccess={(values) => {
                  mutate_resolveWarrantyReceive.mutate(
                     {
                        id: props.issue?.id ?? "",
                        payload: {
                           note: values.receive_note,
                           warranty_status: values.warranty_status ?? "success",
                           receive_bill_images: values.receipt_images,
                        },
                     },
                     {
                        onSuccess: () => {
                           router.push(staff_uri.navbar.dashboard)
                        },
                     },
                  )
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_issueResolveRetunWarehouse}>
            <Issue_Resolve_ReturnWarehouseDrawer
               onSubmit={() => {
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_issueResolveDisassembleReplacementDrawer}>
            <Issue_Resolve_DisassembleReplacementDrawer
               onSuccess={() => {
                  props.refetchFn?.()
                  control_issueResolveDisassembleDrawer.current?.handleClose()
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
                  setTimeout(() => props.autoOpenComplete?.(), 250)
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
