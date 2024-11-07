"use client"

import AlertCard from "@/components/AlertCard"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { clientEnv } from "@/env"
import IssueFailDrawer, { IssueFailDrawerProps } from "@/features/staff/components/overlays/Issue_Fail.drawer"
import ResolveIssueDrawer, { ResolveIssueDrawerProps } from "@/features/staff/components/overlays/ResolveIssue.drawer"
import Issue_Resolve_DisassembleDrawer, {
   Issue_Resolve_DisassembleDrawerProps,
} from "@/features/staff/components/overlays/warranty/Issue_Resolve_Disassemble.drawer"
import ResolveIssue_WarrantyDrawer, {
   ResolveIssue_WarrantyDrawerProps,
} from "@/features/staff/components/overlays/warranty/ResolveIssue_Warranty.drawer"
import staff_mutations from "@/features/staff/mutations"
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
import {
   BookOutlined,
   CheckOutlined,
   CloseOutlined,
   DownOutlined,
   MoreOutlined,
   UpOutlined,
   WarningOutlined,
} from "@ant-design/icons"
import { ChartDonut, Factory, FileText, MapPin, SealWarning, Truck } from "@phosphor-icons/react"
import { App, Button, Card, Descriptions, Drawer, DrawerProps, Dropdown, Image, Segmented } from "antd"
import { useEffect, useRef, useState } from "react"

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
   const { modal, message } = App.useApp()

   const [showTypeErrorDescription, setShowTypeErrorDescription] = useState<boolean>(false)
   const [tab, setTab] = useState<"spare-parts" | "evidence">("spare-parts")

   const control_issueFailDrawer = useRef<RefType<IssueFailDrawerProps>>(null)
   const control_issueResolve_WarrantyDrawer = useRef<RefType<ResolveIssue_WarrantyDrawerProps>>(null)
   const control_issueResolveDrawer = useRef<RefType<ResolveIssueDrawerProps>>(null)
   const control_issueResolveDrawer_forAssemble = useRef<RefType<ResolveIssueDrawerProps>>(null)
   const control_issueResolveDisassembleDrawer = useRef<RefType<Issue_Resolve_DisassembleDrawerProps>>(null)

   const mutate_resolveIssue = staff_mutations.issues.resolve()

   function handleResolveIssue(issueId: string) {
      mutate_resolveIssue.mutate(
         {
            id: issueId,
            payload: {
               imagesVerify: [],
               videosVerify: "",
            },
         },
         {
            onSuccess: () => {
               props.refetchFn?.()
               props.handleClose?.()
            },
         },
      )
   }

   useEffect(() => {
      if (!props.open) {
         setShowTypeErrorDescription(false)
      }
   }, [props.open])

   useEffect(() => {
      if (props.issue?.status === IssueStatusEnum.RESOLVED) {
         setTab("evidence")
      } else {
         setTab("spare-parts")
      }
   }, [props.issue?.status])

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

                        switch(props.issue.typeError.id) {
                           case DisassembleDeviceTypeErrorId: {
                              control_issueResolveDisassembleDrawer.current?.handleOpen({
                                 issue: props.issue
                              })
                              return
                           }
                           case SendWarrantyTypeErrorId: {
                              control_issueResolve_WarrantyDrawer.current?.handleOpen({
                                 issue: props.issue,
                                 request: props.request,
                              })
                              return
                           }
                           case ReceiveWarrantyTypeErrorId: {
                              control_issueResolveDrawer.current?.handleOpen({
                                 issue: props.issue,
                              })
                              return
                           }
                           case AssembleDeviceTypeErrorId: {
                              control_issueResolveDrawer_forAssemble.current?.handleOpen({
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
                                 control_issueFailDrawer.current?.handleOpen({
                                    issueId: props.issue.id,
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
                     ...(props.issue.typeError.id === AssembleDeviceTypeErrorId
                        ? [
                             {
                                label: (
                                   <div className={"flex items-center gap-1"}>
                                      <MapPin size={18} weight={"fill"} />
                                      <span>Vị trí lắp đặt</span>
                                   </div>
                                ),
                                children: (
                                   <div>
                                      {props.task?.device.area.name}{" "}
                                      {props.task?.device.positionX && props.task?.device.positionY
                                         ? `(${props.task?.device.positionX}, ${props.task?.device.positionY})`
                                         : ""}
                                   </div>
                                ),
                             },
                          ]
                        : []),
                     {
                        label: (
                           <div className={"flex items-center gap-1"}>
                              <Truck size={18} weight={"fill"} />
                              <span>Điều khoản bảo hành</span>
                           </div>
                        ),
                        children: (
                           <Card
                              className={"mt-2 h-20 w-full border-[1px] border-orange-500 text-neutral-500"}
                              size={"small"}
                              onClick={() => {
                                 modal.info({
                                    title: "Điều khoản bảo hành",
                                    content: <div>{props.machineModel?.description}</div>,
                                    centered: true,
                                    maskClosable: true,
                                    closable: true,
                                    footer: false,
                                    height: "90%",
                                 })
                              }}
                           >
                              {props.machineModel?.description}
                           </Card>
                        ),
                        className: "*:flex-col",
                     },
                     // ...(props.issue.typeError.id === ReceiveWarrantyTypeErrorId
                     //    ? [
                     //         {
                     //            label: (
                     //               <div className={"flex items-center gap-1"}>
                     //                  <File size={18} weight={"fill"} />
                     //                  <span>Biên lai gửi bảo hành</span>
                     //               </div>
                     //            ),
                     //            children: (
                     //               <div className={"grid grid-cols-4 gap-2"}>
                     //                  {props.request?.issues
                     //                     .find((i) => i.typeError.id === SendWarrantyTypeErrorId)
                     //                     ?.imagesVerify.map((img) => (
                     //                        <Image
                     //                           key={img}
                     //                           src={clientEnv.BACKEND_URL + `/file-image/${img}`}
                     //                           alt="image"
                     //                           className="aspect-square h-full rounded-lg"
                     //                        />
                     //                     ))}
                     //               </div>
                     //            ),
                     //         },
                     //      ]
                     //    : []),
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
               {(props.issue.typeError.id === SendWarrantyTypeErrorId ||
                  props.issue.typeError.id === ReceiveWarrantyTypeErrorId) && (
                  <>
                     <Segmented
                        block
                        className={"mt-6"}
                        value={tab}
                        onChange={(value) => setTab(value as any)}
                        size={"large"}
                        options={[
                           ...(props.issue.status === IssueStatusEnum.RESOLVED
                              ? [
                                   {
                                      label: "Minh chứng",
                                      value: "evidence",
                                      icon: <BookOutlined />,
                                   },
                                ]
                              : []),
                        ]}
                     />
                     <section className={"mt-3"}>
                        {tab === "evidence" && (
                           <div>
                              {props.issue.status === IssueStatusEnum.RESOLVED && (
                                 <>
                                    <section>
                                       <h2 className="mb-2 text-sub-base font-medium">Hình ảnh minh chứng</h2>
                                       {props.issue.imagesVerify.length !== 0 ? (
                                          <div className="grid grid-cols-3 gap-3">
                                             {props.issue.imagesVerify.map((img) => (
                                                <Image
                                                   key={img}
                                                   src={clientEnv.BACKEND_URL + `/file-image/${img}`}
                                                   alt="image"
                                                   className="aspect-square h-full rounded-lg"
                                                />
                                             ))}
                                          </div>
                                       ) : (
                                          <div className="grid h-20 w-full place-content-center rounded-lg bg-neutral-100">
                                             Không có
                                          </div>
                                       )}
                                    </section>
                                    <section className="mt-4">
                                       <h2 className="mb-2 text-sub-base font-medium">Video minh chứng</h2>
                                       {!!props.issue.videosVerify ? (
                                          <video width="100%" height="240" controls>
                                             <source
                                                src={clientEnv.BACKEND_URL + `/file-video/${props.issue.videosVerify}`}
                                                type="video/mp4"
                                             />
                                          </video>
                                       ) : (
                                          <div className="grid h-20 w-full place-content-center rounded-lg bg-neutral-100">
                                             Không có
                                          </div>
                                       )}
                                    </section>
                                 </>
                              )}
                           </div>
                        )}
                     </section>
                  </>
               )}
            </>
         )}
         <OverlayControllerWithRef ref={control_issueFailDrawer}>
            <IssueFailDrawer
               onSuccess={() => {
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
            />
         </OverlayControllerWithRef>
         {/* Resolve issue for send warranty issue */}
         <OverlayControllerWithRef ref={control_issueResolve_WarrantyDrawer}>
            <ResolveIssue_WarrantyDrawer
               onFinish={() => {
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
            />
         </OverlayControllerWithRef>
         {/* Resolve issue with images and video */}
         <OverlayControllerWithRef ref={control_issueResolveDrawer}>
            <ResolveIssueDrawer
               onFinish={() => {
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
               labels={{
                  image: "Biên lai sau bảo hành (bắt buộc)",
                  video: "Video xác nhận (nếu có)",
               }}
               submitConditions={(images, video) => {
                  if (images.length === 0) {
                     message.error("Vui lòng chụp hình biên lai sau bảo hành")
                     return false
                  }

                  return true
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_issueResolveDrawer_forAssemble}>
            <ResolveIssueDrawer
               onFinish={() => {
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_issueResolveDisassembleDrawer}>
            <Issue_Resolve_DisassembleDrawer />
         </OverlayControllerWithRef>
      </Drawer>
   )
}

export default IssueViewDetails_WarrantyDrawer
export type { IssueViewDetails_WarrantyDrawerProps }
