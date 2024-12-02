"use client"

import DateViewSwitcher from "@/components/DateViewSwitcher"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import DeviceDetails from "@/features/head-maintenance/components/DeviceDetails"
import Request_ApproveToRenewDrawer, {
   Request_ApproveToRenewDrawerProps,
} from "@/features/head-maintenance/components/overlays/renew/Request_ApproveToRenew.drawer"
import Request_ApproveToFixDrawer, {
   Request_ApproveToFixDrawerProps,
} from "@/features/head-maintenance/components/overlays/Request_ApproveToFix.drawer"
import Request_RejectDrawer, {
   Request_RejectDrawerProps,
} from "@/features/head-maintenance/components/overlays/Request_Reject.drawer"
import Request_ApproveToWarrantyDrawer, {
   Request_ApproveToWarrantyDrawerProps,
} from "@/features/head-maintenance/components/overlays/warranty/Request_ApproveToWarranty.drawer"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import hm_uris from "@/features/head-maintenance/uri"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import useScanQrCodeDrawer from "@/lib/hooks/useScanQrCodeDrawer"
import { Clock, Note, QrCode, Swap, User, Wrench } from "@phosphor-icons/react"
import { UseQueryResult } from "@tanstack/react-query"
import { App, Button, Card, Divider, Dropdown, Spin, Typography } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { DeleteFilled, MoreOutlined, TruckFilled } from "@ant-design/icons"
import MachineModelUtil from "@/lib/domain/MachineModel/MachineModel.util"
import { cn } from "@/lib/utils/cn.util"
import PageLoader from "@/components/PageLoader"

function Page({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { modal } = App.useApp()

   const api_request = head_maintenance_queries.request.one({ id: params.id })

   const control_requestRejectDrawer = useRef<RefType<Request_RejectDrawerProps>>(null),
      control_requestApprove_WarrantyDrawer = useRef<RefType<Request_ApproveToWarrantyDrawerProps>>(null),
      control_requestApprove_FixDrawer = useRef<RefType<Request_ApproveToFixDrawerProps>>(null),
      control_requestApprove_RenewDrawer = useRef<RefType<Request_ApproveToRenewDrawerProps>>(null),
      control_qrScanner = Page.useQrScanner({ requestId: params.id, api_request })

   function handleBack() {
      if (!api_request.isSuccess) {
         router.push(hm_uris.navbar.requests)
      } else {
         router.push(hm_uris.navbar.requests + "?status=" + api_request.data.status)
      }
   }

   useEffect(() => {
      if (
         api_request.data?.status === FixRequestStatus.APPROVED ||
         api_request.data?.status === FixRequestStatus.IN_PROGRESS ||
         api_request.data?.status === FixRequestStatus.HEAD_CONFIRM ||
         api_request.data?.status === FixRequestStatus.CLOSED
      ) {
         if (api_request.data.is_fix) {
            router.push(hm_uris.stack.requests_id_fix(params.id))
            return
         }

         if (api_request.data.is_rennew) {
            router.push(hm_uris.stack.requests_id_renew(params.id))
            return
         }

         if (api_request.data.is_warranty) {
            router.push(hm_uris.stack.requests_id_warranty(params.id))
            return
         }
      }
   }, [api_request.data])

   if (api_request.isPending) {
      return <PageLoader />
   }

   if (api_request.isError) {
      return <div>Error: {api_request?.error?.message}</div>
   }

   return (
      <>
         <main className="min-h-screen pb-20">
            <div className="absolute left-0 top-0 z-0 h-36 w-full bg-head_maintenance" />
            <PageHeaderV2
               prevButton={<PageHeaderV2.BackButton onClick={handleBack} />}
               title="Chi tiết yêu cầu"
               nextButton={<PageHeaderV2.InfoButton />}
            />
            <section className="mb-layout px-layout">
               <Card size="small" className="z-10 text-sm">
                  <section className="flex pb-3">
                     <h2 className="font-medium">
                        <Clock size={16} weight="fill" className="mr-1.5 inline" />
                        Ngày tạo
                     </h2>
                     <p className="ml-auto text-neutral-700">
                        <DateViewSwitcher date={api_request.data.createdAt} />
                     </p>
                  </section>
                  <Divider className="m-0" />
                  <section className="flex py-3">
                     <h2 className="font-medium">
                        <User size={16} weight="fill" className="mr-1.5 inline" />
                        Người tạo
                     </h2>
                     <p className="ml-auto text-neutral-700">{api_request.data.requester.username}</p>
                  </section>
                  <Divider className="m-0" />
                  <section className="flex pt-3">
                     <h2 className="font-medium">
                        <Note size={16} weight="fill" className="mr-1.5 inline" />
                        Vấn đề
                     </h2>
                     <p className="ml-auto">{api_request.data.requester_note.split(":")[0]}</p>
                  </section>
                  <section className="mt-2">
                     <Typography.Paragraph
                        onClick={() =>
                           modal.info({
                              title: "Vấn đề cần giải quyết",
                              content: api_request.data.requester_note.split(":").slice(1).join(":"),
                              maskClosable: true,
                              footer: false,
                              centered: true,
                           })
                        }
                        ellipsis={{
                           rows: 2,
                           symbol: " Xem thêm",
                        }}
                        className="m-0 text-sm text-neutral-500"
                     >
                        {api_request.data.requester_note.split(":").slice(1).join(":")}
                     </Typography.Paragraph>
                  </section>
               </Card>
            </section>
            <section className="px-layout">
               <div className="w-max rounded-t-lg bg-red-800 px-3 py-1 font-semibold text-white">
                  <Wrench size={18} className="mr-1.5 inline" weight="fill" />
                  Thông tin thiết bị
               </div>
               <DeviceDetails device={api_request.data.device} className="z-10 rounded-tl-none" requestId={params.id} />
            </section>
            <footer className="fixed bottom-0 left-0 z-50 flex w-full items-center gap-3 border-t-[1px] border-t-neutral-100 bg-white p-layout">
               {control_qrScanner.isScanned === false ? (
                  <Button
                     block
                     type="primary"
                     icon={<QrCode size={18} />}
                     onClick={() => control_qrScanner.handleOpenScanner()}
                  >
                     Quét QR thiết bị
                  </Button>
               ) : (
                  <>
                     {MachineModelUtil.canBeWarranted(api_request.data?.device.machineModel) === true ? (
                        <Button
                           block
                           className="w-full"
                           type="primary"
                           icon={<TruckFilled size={18} />}
                           onClick={() =>
                              control_requestApprove_WarrantyDrawer.current?.handleOpen({
                                 requestId: params.id,
                              })
                           }
                        >
                           Bảo hành thiết bị
                        </Button>
                     ) : (
                        <Button
                           block
                           type="primary"
                           icon={<Wrench size={18} />}
                           onClick={() =>
                              control_requestApprove_FixDrawer.current?.handleOpen({
                                 requestId: params.id,
                              })
                           }
                        >
                           Sửa chữa thiết bị
                        </Button>
                     )}
                     <Dropdown
                        menu={{
                           items: [
                              {
                                 key: "fix-device",
                                 label: "Sửa chữa máy",
                                 icon: <Wrench size={16} weight={"duotone"} />,
                                 onClick: () =>
                                    control_requestApprove_FixDrawer.current?.handleOpen({
                                       requestId: params.id,
                                    }),
                                 className: cn(
                                    MachineModelUtil.canBeWarranted(api_request.data?.device.machineModel) !== true &&
                                       "hidden",
                                 ),
                              },
                              {
                                 key: "renew-device",
                                 label: "Thay máy mới",
                                 icon: <Swap size={16} weight={"duotone"} />,
                                 onClick: () =>
                                    control_requestApprove_RenewDrawer.current?.handleOpen({
                                       requestId: params.id,
                                    }),
                              },
                              {
                                 type: "divider",
                              },
                              {
                                 key: "reject",
                                 label: "Đóng yêu cầu",
                                 icon: <DeleteFilled />,
                                 onClick: () =>
                                    api_request.isSuccess &&
                                    control_requestRejectDrawer.current?.handleOpen({
                                       request: api_request.data,
                                    }),
                                 danger: true,
                              },
                           ],
                        }}
                     >
                        <Button className={"aspect-square"} icon={<MoreOutlined />} />
                     </Dropdown>
                  </>
               )}
            </footer>
         </main>
         <OverlayControllerWithRef ref={control_requestRejectDrawer}>
            <Request_RejectDrawer
               onSuccess={async () => {
                  router.push(hm_uris.navbar.requests + `?status=${FixRequestStatus.REJECTED}`)
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_requestApprove_FixDrawer}>
            <Request_ApproveToFixDrawer
               onSuccess={() => {
                  router.push(hm_uris.navbar.requests + `?status=${FixRequestStatus.APPROVED}`)
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_requestApprove_WarrantyDrawer}>
            <Request_ApproveToWarrantyDrawer
               onSuccess={() => {
                  router.push(hm_uris.navbar.requests + `?status=${FixRequestStatus.APPROVED}`)
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_requestApprove_RenewDrawer}>
            <Request_ApproveToRenewDrawer
               onSuccess={() => router.push(hm_uris.navbar.requests + `?status=${FixRequestStatus.APPROVED}`)}
            />
         </OverlayControllerWithRef>
         {control_qrScanner.contextHolder()}
      </>
   )
}

export default Page

Page.useQrScanner = function PageQrScanner(props: {
   requestId: string
   api_request: UseQueryResult<RequestDto, unknown>
}) {
   const { message } = App.useApp()
   const mutate_updateSeen = head_maintenance_mutations.request.seen({ showMessages: false })

   return useScanQrCodeDrawer(
      {
         closeOnScan: true,
         defaultScanned: props.api_request.data?.is_seen,
         validationFn: async (data) => {
            if (!props.api_request.isSuccess) throw new Error("no-comparable-data")
            return props.api_request.data.device.id === data
         },
         onSuccess: (data) => {
            // on scan success, update seen value in db
            mutate_updateSeen.mutate(
               { id: props.requestId },
               {
                  onSuccess: async () => {
                     await props.api_request.refetch()
                  },
               },
            )
         },
         onError: async (error) => {
            if (error instanceof Error && error.message === "no-comparable-data") {
               message.error("Đã xảy ra lỗi. Vui lòng thử lại...")
            }

            console.error(error)
            message.error("Đã xảy ra lỗi. Vui lòng thử lại...")
         },
      },
      [props.api_request.isSuccess],
   )
}
