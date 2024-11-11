"use client"

import head_maintenance_queries from "@/features/head-maintenance/queries"
import { App, Button, DatePicker, Descriptions, Drawer, DrawerProps } from "antd"
import { CloseOutlined, EditOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import {
   AssembleDeviceTypeErrorId,
   DisassembleDeviceTypeErrorId,
   ReceiveWarrantyTypeErrorId,
   SendWarrantyTypeErrorId,
} from "@/lib/constants/Warranty"
import SignatureUploader from "@/components/SignatureUploader"
import ImageUploader from "@/components/ImageUploader"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Task_AssignFixerV2Drawer, {
   Task_AssignFixerModalProps,
} from "@/features/head-maintenance/components/overlays/Task_AssignFixerV2.drawer"
import { useRef } from "react"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import ClickableArea from "@/components/ClickableArea"
import ViewMapModal, { ViewMapModalProps } from "@/components/overlays/ViewMap.modal"
import { MapPin } from "@phosphor-icons/react"
import IssueFailed_ResolveOptions, {
   IssueFailed_ResolveOptionsProps,
} from "@/features/head-maintenance/components/overlays/warranty/IssueFailed_ResolveOptions.modal"
import Request_ApproveToFixDrawer, {
   Request_ApproveToFixDrawerProps,
} from "@/features/head-maintenance/components/overlays/Request_ApproveToFix.drawer"
import { NewDeviceInstallation, RemoveOldDeviceTypeErrorId } from "@/lib/constants/Renew"

type Issue_ViewDetails_RenewDrawerProps = {
   issueId?: string
   requestId?: string
   refetchFn?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   Issue_ViewDetails_RenewDrawerProps & {
      handleClose?: () => void
   }

function Issue_ViewDetails_RenewDrawer(props: Props) {
   const api_issue = head_maintenance_queries.issue.one(
      {
         id: props.issueId ?? "",
      },
      {
         enabled: !!props.issueId,
      },
   )

//    const mutate_detatchIssueAndRecreateTask = head_maintenance_mutations.issue.detatchAndRecreateTaskWarranty()
   const mutate_assignFixer = head_maintenance_mutations.task.assignFixer()

   const control_taskAssignFixerDrawer = useRef<RefType<Task_AssignFixerModalProps>>(null)
   const control_viewMapModal = useRef<RefType<ViewMapModalProps>>(null)
//    const control_issueFailedResolveOptionsModal = useRef<RefType<IssueFailed_ResolveOptionsProps>>(null)
   const control_requestApproveFixDrawer = useRef<RefType<Request_ApproveToFixDrawerProps>>(null)

   function Footer() {
      // failure states
      if (api_issue.data?.status === IssueStatusEnum.FAILED) {
         switch (api_issue.data.typeError.id) {
            case RemoveOldDeviceTypeErrorId:
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
            case NewDeviceInstallation:
               return (
                  <Button
                     block
                     type="primary"
                     icon={<EditOutlined />}
                    //  onClick={() => {
                    //     control_issueFailedResolveOptionsModal.current?.handleOpen({})
                    //  }}
                  >
                     Cập nhật
                  </Button>
               )
            // case ReceiveWarrantyTypeErrorId:
            //    if (api_issue.data.failReason?.includes("Đổi ngày nhận máy:")) {
            //       return (
            //          <Button
            //             block
            //             type="primary"
            //             icon={<EditOutlined />}
            //             onClick={() =>
            //                api_issue.isSuccess &&
            //                props.requestId &&
            //                control_taskAssignFixerDrawer.current?.handleOpen({
            //                   recommendedFixerIds: [api_issue.data?.task?.fixer?.id],
            //                   defaults: {
            //                      fixer: api_issue.data?.task?.fixer,
            //                   },
            //                })
            //             }
            //          >
            //             Đổi ngày nhận máy
            //          </Button>
            //       )
            //    } else {
            //       return (
            //          <Button
            //             block
            //             type="primary"
            //             icon={<EditOutlined />}
            //             // onClick={() => {
            //             //    control_issueFailedResolveOptionsModal.current?.handleOpen({})
            //             // }}
            //          >
            //             Cập nhật
            //          </Button>
            //       )
            //    }
         }
      }
   }

   return (
      <>
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
            classNames={{ footer: "p-layout", header: "bg-head_maintenance text-white" }}
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
                     label: "Tên bước",
                     children: api_issue.data?.typeError.name,
                  },
                  {
                     label: "Trạng thái",
                     children: api_issue.isSuccess ? IssueStatusEnumTagMapper[api_issue.data.status].text : "-",
                  },
                  {
                     label: "Chi tiết",
                     children: api_issue.data?.typeError.description,
                  },
               ]}
            />
            {api_issue.data?.typeError.id === RemoveOldDeviceTypeErrorId && (
               <>
                  {(api_issue.data.status === IssueStatusEnum.RESOLVED ||
                     api_issue.data.status === IssueStatusEnum.PENDING) && (
                     <>
                        <section className="mt-layout">
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
                           <ImageUploader imageUris={api_issue.data.imagesVerify.slice(1)} />
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
                           <ImageUploader imageUris={api_issue.data.imagesVerifyFail} />
                        </section>
                     </>
                  )}
               </>
            )}
            {api_issue.data?.typeError.id === NewDeviceInstallation && (
               <>
                  {(api_issue.data.status === IssueStatusEnum.RESOLVED ||
                     api_issue.data.status === IssueStatusEnum.PENDING) && (
                     <>
                        <section className="mt-layout">
                           <header className="mb-2">
                              <h3 className="text-base font-semibold">Hình ảnh thiết bị</h3>
                              <p className="font-base text-sm text-neutral-500">Hình ảnh thiết bị sau khi lắp đặt</p>
                           </header>
                           <ImageUploader imageUris={api_issue.data.imagesVerify} />
                        </section>
                     </>
                  )}
               </>
            )}

            {/* {(api_issue.data?.typeError.id === SendWarrantyTypeErrorId ||
               api_issue.data?.typeError.id === ReceiveWarrantyTypeErrorId) && (
               <>
                  {(api_issue.data.status === IssueStatusEnum.RESOLVED ||
                     api_issue.data.status === IssueStatusEnum.PENDING) && (
                     <>
                        <section className="mt-layout">
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
                           <ImageUploader imageUris={api_issue.data?.imagesVerify} />
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
                           <ImageUploader imageUris={api_issue.data.imagesVerifyFail} />
                        </section>
                     </>
                  )}
               </>
            )} */}
         </Drawer>
         {/* <OverlayControllerWithRef ref={control_taskAssignFixerDrawer}>
            <Task_AssignFixerV2Drawer
               onSubmit={async (fixer, date, priority) => {
                  if (!api_issue.isSuccess) return

                  const task = await mutate_detatchIssueAndRecreateTask.mutateAsync({
                     issueDto: api_issue.data,
                     requestId: props.requestId ?? "",
                  })

                  await mutate_assignFixer.mutateAsync({
                     id: task.id,
                     payload: {
                        fixer: fixer.id,
                        fixerDate: date.toISOString(),
                        priority,
                     },
                  })

                  props.handleClose?.()
                  props.refetchFn?.()
               }}
            />
         </OverlayControllerWithRef> */}
         <OverlayControllerWithRef ref={control_viewMapModal}>
            <ViewMapModal />
         </OverlayControllerWithRef>
         {/* <OverlayControllerWithRef ref={control_issueFailedResolveOptionsModal}>
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
            />
         </OverlayControllerWithRef> */}
         {/* <OverlayControllerWithRef ref={control_requestApproveFixDrawer}>
            <Request_ApproveToFixDrawer
               onSuccess={() => {
                  control_requestApproveFixDrawer.current?.handleClose()
                  props.refetchFn?.()
                  props.handleClose?.()
               }}
            />
         </OverlayControllerWithRef> */}
      </>
   )
}

export default Issue_ViewDetails_RenewDrawer
export type { Issue_ViewDetails_RenewDrawerProps }
