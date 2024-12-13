"use client"

import ClickableArea from "@/components/ClickableArea"
import ImageUploader from "@/components/ImageUploader"
import ViewMapModal, { ViewMapModalProps } from "@/components/overlays/ViewMap.modal"
import SignatureUploader from "@/components/SignatureUploader"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Request_ApproveToRenewDrawer, {
   Request_ApproveToRenewDrawerProps,
} from "@/features/head-maintenance/components/overlays/renew/Request_ApproveToRenew.drawer"
import Request_ApproveToFixDrawer, {
   Request_ApproveToFixDrawerProps,
} from "@/features/head-maintenance/components/overlays/Request_ApproveToFix.drawer"
import Task_AssignFixerV2Drawer, {
   Task_AssignFixerModalProps,
} from "@/features/head-maintenance/components/overlays/Task_AssignFixerV2.drawer"
import IssueFailed_ResolveOptions, {
   IssueFailed_ResolveOptionsProps,
} from "@/features/head-maintenance/components/overlays/warranty/IssueFailed_ResolveOptions.modal"
import Request_CloseDrawer, {
   Request_CloseDrawerProps,
} from "@/features/head-maintenance/components/overlays/warranty/Request_Close.drawer"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import hm_uris from "@/features/head-maintenance/uri"
import {
   AssembleDeviceTypeErrorId,
   DisassembleDeviceTypeErrorId,
   ReceiveWarrantyTypeErrorId,
   SendWarrantyTypeErrorId,
} from "@/lib/constants/Warranty"
import { WarrantyFailedGenerator, WarrantyFailedReasonsList } from "@/lib/constants/WarrantyFailedReasons"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { CloseOutlined, EditOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons"
import { ChartDonut, IdentificationCard, MapPin, Note } from "@phosphor-icons/react"
import { Button, ConfigProvider, Descriptions, Divider, Drawer, DrawerProps, App } from "antd"
import { useRouter } from "next/navigation"
import { useRef } from "react"

type Issue_ViewDetails_WarrantyDrawerProps = {
   issueId?: string
   requestId?: string
   refetchFn?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   Issue_ViewDetails_WarrantyDrawerProps & {
      handleClose?: () => void
   }

function Issue_ViewDetails_WarrantyDrawer(props: Props) {
   const router = useRouter()
   const { modal } = App.useApp()
   const api_issue = head_maintenance_queries.issue.one(
      {
         id: props.issueId ?? "",
      },
      {
         enabled: !!props.issueId,
      },
   )

   const mutate_detatchIssueAndRecreateTask = head_maintenance_mutations.issue.detatchAndRecreateTaskWarranty()
   const mutate_requestWarrantyFailed = head_maintenance_mutations.request.warrantyFailed()
   const mutate_completeTask = head_maintenance_mutations.task.complete()

   const control_taskAssignFixerDrawer = useRef<RefType<Task_AssignFixerModalProps>>(null)
   const control_viewMapModal = useRef<RefType<ViewMapModalProps>>(null)
   const control_issueFailedResolveOptionsModal = useRef<RefType<IssueFailed_ResolveOptionsProps>>(null)
   const control_requestApproveFixDrawer = useRef<RefType<Request_ApproveToFixDrawerProps>>(null)
   const control_requestApproveRenewDrawer = useRef<RefType<Request_ApproveToRenewDrawerProps>>(null)
   const control_requestCloseDrawer = useRef<RefType<Request_CloseDrawerProps>>(null)

   function Footer() {
      // failure states
      if (api_issue.data?.status === IssueStatusEnum.FAILED) {
         switch (api_issue.data.typeError.id) {
            case DisassembleDeviceTypeErrorId:
               return (
                  <Button
                     block
                     type="primary"
                     icon={<EditOutlined />}
                     onClick={() =>
                        api_issue.isSuccess &&
                        props.requestId &&
                        control_taskAssignFixerDrawer.current?.handleOpen({
                           recommendedFixerIds: [api_issue.data?.task?.fixer?.id],
                        })
                     }
                  >
                     Phân công lại
                  </Button>
               )
            case SendWarrantyTypeErrorId:
               return (
                  <Button
                     block
                     type="primary"
                     icon={<EditOutlined />}
                     onClick={() => {
                        const taskId = api_issue.data?.task.id
                        if (!taskId) return

                        modal.confirm({
                           title: "Xác nhận đóng tác vụ",
                           content: "Bạn có chắc muốn đóng tác vụ này không?",
                           centered: true,
                           maskClosable: true,
                           closable: true,
                           okText: "Có",
                           cancelText: "Không",
                           onOk: () => {
                              mutate_completeTask.mutate(
                                 {
                                    id: taskId,
                                 },
                                 {
                                    onSuccess: () => {
                                       props.handleClose?.()
                                       props.refetchFn?.()
                                    },
                                 },
                              )
                           },
                        })
                     }}
                  >
                     Đóng tác vụ
                  </Button>
               )
            // const errorType = api_issue.data.failReason?.split(":")[0]

            // const showButtons: any = ["renew", "fix", "close"]
            // if (errorType === WarrantyFailedReasonsList.SERVICE_CENTER_CLOSED) {
            //    showButtons.push("warranty")
            // }

            // return (
            //    <Button
            //       block
            //       type="primary"
            //       icon={<EditOutlined />}
            //       onClick={() => {
            //          control_issueFailedResolveOptionsModal.current?.handleOpen({
            //             showButtons,
            //          })
            //       }}
            //    >
            //       Xử lý lỗi
            //    </Button>
            // )
            case ReceiveWarrantyTypeErrorId:
               if (api_issue.data.failReason?.includes(WarrantyFailedReasonsList.CHANGE_RECEIVE_DATE)) {
                  return (
                     <Button
                        block
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                           if (!api_issue.isSuccess) return
                           const date = WarrantyFailedGenerator[WarrantyFailedReasonsList.CHANGE_RECEIVE_DATE].getDate(
                              api_issue.data.failReason ?? "",
                           )
                           mutate_detatchIssueAndRecreateTask.mutate(
                              {
                                 issueDto: api_issue.data,
                                 requestId: props.requestId ?? "",
                                 fixerDate: date.toISOString(),
                                 fixerId: api_issue.data.task.fixer.id,
                                 priority: api_issue.data.task.priority,
                              },
                              {
                                 onSuccess: () => {
                                    props.handleClose?.()
                                    props.refetchFn?.()
                                 },
                              },
                           )
                        }}
                     >
                        Đổi ngày nhận máy
                     </Button>
                  )
               } else if (
                  api_issue.data.failReason?.includes(WarrantyFailedReasonsList.WARRANTY_REJECTED_AFTER_PROCESS)
               ) {
                  return undefined
               } else {
                  return (
                     <Button
                        block
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                           control_issueFailedResolveOptionsModal.current?.handleOpen({})
                        }}
                     >
                        Cập nhật
                     </Button>
                  )
               }
         }
      }
   }

   function getComponentColor(status?: IssueStatusEnum) {
      if (!status) return undefined
      switch (status) {
         case IssueStatusEnum.FAILED:
            return {
               color: "#ef4444",
               className: "bg-red-500",
            }
         case IssueStatusEnum.RESOLVED:
            return {
               color: "#10B981",
               className: "bg-green-500",
            }
         case IssueStatusEnum.PENDING:
            return {
               color: "rgb(110, 110, 110)",
               className: "bg-neutral-500",
            }
         default:
            return {
               color: undefined,
               className: "bg-head_maintenance",
            }
      }
   }

   const componentColor = getComponentColor(api_issue.data?.status)

   return (
      <>
         <ConfigProvider
            theme={{
               token: {
                  ...(componentColor?.color !== undefined
                     ? {
                          colorPrimary: componentColor.color,
                       }
                     : {}),
               },
            }}
         >
            <Drawer
               title={
                  <div className={"flex items-center justify-between"}>
                     <Button icon={<CloseOutlined className={"text-white"} />} type={"text"} onClick={props.onClose} />
                     <h1>Thông tin bước</h1>
                     <Button icon={<MoreOutlined className={"text-white"} />} type={"text"} />
                  </div>
               }
               closeIcon={false}
               placement="bottom"
               height="max-content"
               loading={api_issue.isPending}
               footer={<Footer />}
               classNames={{
                  footer: "p-layout",
                  header: cn("text-white", componentColor?.className),
               }}
               {...props}
            >
               <Descriptions
                  size="small"
                  colon={false}
                  contentStyle={{
                     display: "flex",
                     justifyContent: "flex-end",
                     marginLeft: "1rem",
                     textAlign: "right",
                  }}
                  items={[
                     {
                        label: (
                           <div className="flex items-center gap-2">
                              <IdentificationCard size={16} weight="duotone" />
                              <span>Tên bước</span>
                           </div>
                        ),
                        children: api_issue.data?.typeError.name,
                     },
                     {
                        label: (
                           <div className="flex items-center gap-2">
                              <ChartDonut size={16} weight="duotone" />
                              <span>Trạng thái</span>
                           </div>
                        ),
                        children: api_issue.isSuccess ? IssueStatusEnumTagMapper[api_issue.data.status].text : "-",
                     },
                     {
                        label: (
                           <div className="flex items-center gap-2">
                              <Note size={16} weight="duotone" />
                              <span>Chi tiết</span>
                           </div>
                        ),
                        children: api_issue.data?.typeError.description,
                     },
                  ]}
               />
               <Divider />
               {api_issue.data?.typeError.id === DisassembleDeviceTypeErrorId && (
                  <>
                     {(api_issue.data.status === IssueStatusEnum.RESOLVED ||
                        api_issue.data.status === IssueStatusEnum.PENDING) && (
                        <>
                           <section className="">
                              <header className="mb-2">
                                 <h3 className="text-base font-semibold">Chữ ký xác nhận</h3>
                                 <p className="font-base text-sm text-neutral-500">Chứ ký từ trưởng phòng bảo trì</p>
                              </header>
                              <SignatureUploader signature={api_issue.data.imagesVerify[0]} />
                           </section>
                           <section className="mt-layout">
                              <header className="mb-2">
                                 <h3 className="text-base font-semibold">Hình ảnh thiết bị</h3>
                                 <p className="font-base text-sm text-neutral-500">Hình ảnh thiết bị sau khi tháo gỡ</p>
                              </header>
                              <ImageUploader value={api_issue.data.imagesVerify.slice(1)} />
                           </section>
                        </>
                     )}
                     {api_issue.data.status === IssueStatusEnum.FAILED && (
                        <>
                           <section className="">
                              <header className="mb-2">
                                 <h3 className="text-base font-semibold">Lý do thất bại</h3>
                                 <p className="font-base text-sm text-neutral-500"></p>
                              </header>
                              <div>{api_issue.data.failReason}</div>
                           </section>
                           <section className="mt-layout">
                              <header className="mb-2">
                                 <h3 className="text-base font-semibold">Hình ảnh đính kèm</h3>
                              </header>
                              <ImageUploader value={api_issue.data.imagesVerifyFail} />
                           </section>
                        </>
                     )}
                  </>
               )}
               {api_issue.data?.typeError.id === AssembleDeviceTypeErrorId && (
                  <>
                     {(api_issue.data.status === IssueStatusEnum.RESOLVED ||
                        api_issue.data.status === IssueStatusEnum.PENDING) && (
                        <>
                           <section className="">
                              <header className="mb-2">
                                 <h3 className="text-base font-semibold">Hình ảnh thiết bị</h3>
                                 <p className="font-base text-sm text-neutral-500">Hình ảnh thiết bị sau khi lắp đặt</p>
                              </header>
                              <ImageUploader value={api_issue.data.imagesVerify} />
                           </section>
                        </>
                     )}
                  </>
               )}

               {(api_issue.data?.typeError.id === SendWarrantyTypeErrorId ||
                  api_issue.data?.typeError.id === ReceiveWarrantyTypeErrorId) && (
                  <>
                     {(api_issue.data.status === IssueStatusEnum.RESOLVED ||
                        api_issue.data.status === IssueStatusEnum.PENDING) && (
                        <>
                           <section className="">
                              <ClickableArea
                                 className="items-center justify-start p-3"
                                 block
                                 onClick={() =>
                                    control_viewMapModal.current?.handleOpen({
                                       coordinates: api_issue.data?.resolvedNote as unknown as GeolocationCoordinates,
                                    })
                                 }
                              >
                                 <MapPin size={32} />
                                 <div className="flex flex-grow flex-col items-start justify-start">
                                    <h1 className="text-base font-bold">Vị trí hiện tại</h1>
                                    <p className="font-base text-sm text-neutral-500">
                                       Xác minh vị trí trung tâm bảo hành
                                    </p>
                                 </div>
                                 <RightOutlined />
                              </ClickableArea>
                           </section>
                           <section className="mt-8">
                              <header className="mb-2">
                                 <h3 className="text-base font-semibold">Hình ảnh biên nhận</h3>
                                 <p className="font-base text-sm text-neutral-500">
                                    Vui lòng tải hình ảnh biên nhận bảo hành
                                 </p>
                              </header>
                              <ImageUploader value={api_issue.data?.imagesVerify} />
                           </section>
                        </>
                     )}
                     {api_issue.data.status === IssueStatusEnum.FAILED && (
                        <>
                           <section className="mt-layout">
                              <header className="mb-2">
                                 <h3 className="text-base font-semibold">Lý do thất bại</h3>
                                 <p className="font-base text-sm text-neutral-500"></p>
                              </header>
                              <div>{api_issue.data.failReason}</div>
                           </section>
                           <section className="mt-layout">
                              <header className="mb-2">
                                 <h3 className="text-base font-semibold">Hình ảnh đính kèm</h3>
                              </header>
                              <ImageUploader value={api_issue.data.imagesVerifyFail} />
                           </section>
                        </>
                     )}
                  </>
               )}
            </Drawer>
         </ConfigProvider>
         <OverlayControllerWithRef ref={control_taskAssignFixerDrawer}>
            <Task_AssignFixerV2Drawer
               onSubmit={async (fixer, date, priority) => {
                  if (!api_issue.isSuccess) return

                  const task = await mutate_detatchIssueAndRecreateTask.mutateAsync({
                     issueDto: api_issue.data,
                     requestId: props.requestId ?? "",
                     fixerDate: date.toISOString(),
                     fixerId: fixer.id,
                     priority,
                  })

                  props.handleClose?.()
                  props.refetchFn?.()
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_viewMapModal}>
            <ViewMapModal />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_issueFailedResolveOptionsModal}>
            <IssueFailed_ResolveOptions
               onChooseWarranty={() => {
                  api_issue.isSuccess &&
                     props.requestId &&
                     control_taskAssignFixerDrawer.current?.handleOpen({
                        recommendedFixerIds: [api_issue.data?.task?.fixer?.id],
                     })
               }}
               onChooseFix={() => {
                  props.requestId && control_requestApproveFixDrawer.current?.handleOpen({ requestId: props.requestId })
               }}
               onChooseRenew={() => {
                  props.requestId &&
                     control_requestApproveRenewDrawer.current?.handleOpen({ requestId: props.requestId })
               }}
               onChooseClose={() => {
                  props.requestId && control_requestCloseDrawer.current?.handleOpen({ requestId: props.requestId })
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_requestApproveFixDrawer}>
            <Request_ApproveToFixDrawer
               isMultiple={true}
               onSuccess={async () => {
                  if (!props.requestId) return
                  mutate_requestWarrantyFailed.mutate(
                     {
                        id: props.requestId,
                     },
                     {
                        onSettled: () => {
                           router.push(hm_uris.stack.requests_id_fix(props.requestId ?? ""))
                        },
                     },
                  )
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_requestApproveRenewDrawer}>
            <Request_ApproveToRenewDrawer
               isMultiple={true}
               onSuccess={() => {
                  if (!props.requestId) return
                  mutate_requestWarrantyFailed.mutate(
                     {
                        id: props.requestId,
                     },
                     {
                        onSettled: () => {
                           router.push(hm_uris.stack.requests_id_renew(props.requestId ?? ""))
                        },
                     },
                  )
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_requestCloseDrawer}>
            <Request_CloseDrawer
               onSuccess={() => {
                  router.push(hm_uris.navbar.requests)
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default Issue_ViewDetails_WarrantyDrawer
export type { Issue_ViewDetails_WarrantyDrawerProps }
