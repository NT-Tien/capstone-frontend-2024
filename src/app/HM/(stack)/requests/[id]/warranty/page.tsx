"use client"

import TabbedLayout from "@/app/HM/(stack)/requests/[id]/warranty/Tabs.component"
import ViewDetailsDrawer, { ViewDetailsDrawerProps } from "@/app/HM/(stack)/requests/[id]/warranty/ViewDetails.drawer"
import ClickableArea from "@/components/ClickableArea"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import PageError from "@/components/PageError"
import PageLoader from "@/components/PageLoader"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import HeadStaff_Device_OneById from "@/features/head-maintenance/api/device/one-byId.api"
import HeadStaff_Device_OneByIdWithHistory from "@/features/head-maintenance/api/device/one-byIdWithHistory.api"
import HeadStaff_Request_OneById from "@/features/head-maintenance/api/request/oneById.api"
import Request_RejectDrawer, {
   Request_RejectDrawerProps,
} from "@/features/head-maintenance/components/overlays/Request_Reject.drawer"
import Task_ViewDetailsDrawer, {
   TaskDetailsDrawerRefType,
} from "@/features/head-maintenance/components/overlays/Task_ViewDetails.drawer"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import headstaff_qk from "@/features/head-maintenance/qk"
import hm_uris from "@/features/head-maintenance/uri"
import { SystemRenewTypeErrorIds } from "@/lib/constants/Renew"
import {
   SendWarrantyTypeErrorId,
   DisassembleDeviceTypeErrorId,
   ReceiveWarrantyTypeErrorId,
   AssembleDeviceTypeErrorId,
} from "@/lib/constants/Warranty"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { NotFoundError } from "@/lib/error/not-found.error"
import { cn } from "@/lib/utils/cn.util"
import { DownOutlined, InfoCircleFilled, UpOutlined } from "@ant-design/icons"
import { Calendar, ChartDonut, Note, Swap, User, Wrench } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { App, ConfigProvider, Descriptions, Dropdown, Typography } from "antd"
import Button from "antd/es/button"
import Card from "antd/es/card"
import Result from "antd/es/result"
import Spin from "antd/es/spin"
import Tag from "antd/es/tag"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { Suspense, useMemo, useRef } from "react"

function Page({ params, searchParams }: { params: { id: string }; searchParams: { viewingHistory?: string } }) {
   const router = useRouter()
   const { modal } = App.useApp()

   const control_rejectRequestDrawer = useRef<RefType<Request_RejectDrawerProps> | null>(null)
   const control = useRef<RefType<ViewDetailsDrawerProps>>(null)

   const mutate_closeRequest = head_maintenance_mutations.request.finish()

   const api_request = useQuery({
      queryKey: headstaff_qk.request.byId(params.id),
      queryFn: () =>
         HeadStaff_Request_OneById({ id: params.id }).then((res) => {
            console.log(res, res === null)
            if (res === null) {
               throw new NotFoundError("Request")
            }
            return res
         }),
   })

   const api_device = useQuery({
      queryKey: headstaff_qk.device.byId(api_request.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: api_request.data?.device.id ?? "" }),
      enabled: api_request.isSuccess,
   })

   const api_deviceHistory = useQuery({
      queryKey: headstaff_qk.device.byIdWithHistory(api_request.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneByIdWithHistory({ id: api_request.data?.device.id ?? "" }),
      select: (data) => data.requests.filter((req) => req.id !== params.id),
      enabled: api_request.isSuccess,
   })

   const sendWarrantyTask = useMemo(() => {
      if (!api_request.isSuccess) return

      return api_request.data.tasks
         .filter((t) =>
            t.issues.find(
               (i) => i.typeError.id === SendWarrantyTypeErrorId || i.typeError.id === DisassembleDeviceTypeErrorId,
            ),
         )
         .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))[0]
   }, [api_request.data?.tasks, api_request.isSuccess])

   const receiveWarrantyTask = useMemo(() => {
      if (!api_request.isSuccess) return

      return api_request.data.tasks
         .filter((t) =>
            t.issues.find(
               (i) => i.typeError.id === ReceiveWarrantyTypeErrorId || i.typeError.id === AssembleDeviceTypeErrorId,
            ),
         )
         .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))[0]
   }, [api_request.data?.tasks, api_request.isSuccess])

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

   if (api_request.isPending) {
      return <PageLoader />
   }

   if (api_request.isError) {
      return <PageError />
   }

   return (
      <div className="relative flex min-h-screen flex-col bg-head_maintenance">
         <PageHeaderV2
            prevButton={
               <PageHeaderV2.BackButton
                  onClick={() =>
                     api_request.isSuccess
                        ? router.push(hm_uris.navbar.requests + `?status=${api_request.data.status}`)
                        : router.back()
                  }
               />
            }
            title={
               api_request.isSuccess && api_request.data.is_multiple_types ? (
                  <Dropdown
                     menu={{
                        items: [
                           {
                              icon: <Wrench size={16} weight="fill" />,
                              label: "sửa chứa",
                              key: "fix",
                              onClick: () => {
                                 router.push(hm_uris.stack.requests_id_fix(params.id))
                              },
                           },
                           {
                              icon: <Swap size={16} weight="fill" />,
                              label: "Thay máy mới",
                              key: "renew",
                              onClick: () => {
                                 router.push(hm_uris.stack.requests_id_renew(params.id))
                              },
                           },
                        ],
                     }}
                  >
                     <Button
                        className="text-lg font-bold text-white"
                        iconPosition="end"
                        icon={<DownOutlined />}
                        type="text"
                     >
                        Yêu cầu: Bảo hành
                     </Button>
                  </Dropdown>
               ) : (
                  "Yêu cầu: Bảo hành"
               )
            }
            nextButton={
               <Dropdown
                  menu={{
                     items: [
                        {
                           key: "1-main",
                           label: "Đóng yêu cầu",
                           onClick: () => {
                              modal.confirm({
                                 title: "Lưu ý",
                                 content: "Bạn có chắc muốn đóng yêu cầu này?",
                                 centered: true,
                                 maskClosable: true,
                                 onOk: () => {
                                    mutate_closeRequest.mutate(
                                       {
                                          id: params.id,
                                       },
                                       {
                                          onSuccess: () => {
                                             router.push(hm_uris.navbar.requests + `?status=${FixRequestStatus.CLOSED}`)
                                          },
                                       },
                                    )
                                 },
                              })
                           },
                        },
                     ],
                  }}
               >
                  <PageHeaderV2.InfoButton />
               </Dropdown>
            }
            className={"relative z-50"}
            type={"light"}
         />

         <div className="px-layout">
            <section
               className={cn(
                  "relative z-50 overflow-hidden rounded-lg border-2 border-neutral-200 bg-white p-layout-half shadow-lg",
               )}
            >
               <Descriptions
                  size="small"
                  colon={false}
                  contentStyle={{
                     display: "flex",
                     justifyContent: "flex-end",
                  }}
                  items={[
                     {
                        label: (
                           <div className="flex items-center gap-1">
                              <Calendar size={17} weight="duotone" />
                              <h2>Ngày tạo</h2>
                           </div>
                        ),
                        children: dayjs(api_request.data.createdAt).format("DD/MM/YYYY - HH:mm"),
                     },
                     {
                        label: (
                           <div className="flex items-center gap-1">
                              <User size={17} weight="duotone" />
                              <h2>Người yêu cầu</h2>
                           </div>
                        ),
                        children: api_request.data.requester.username,
                     },
                     {
                        label: (
                           <div className="flex items-center gap-1">
                              <ChartDonut size={17} weight="duotone" />
                              <h2>Trạng thái</h2>
                           </div>
                        ),
                        children: (
                           <Tag className="m-0" color={FixRequest_StatusMapper(api_request.data).colorInverse}>
                              {FixRequest_StatusMapper(api_request.data).text}
                           </Tag>
                        ),
                     },
                     {
                        label: (
                           <div className="flex items-center gap-1">
                              <Note size={17} weight="duotone" />
                              <h2>Ghi chú</h2>
                           </div>
                        ),
                        children: (
                           <Typography.Link
                              className="ml-6 truncate"
                              onClick={() =>
                                 control.current?.handleOpen({
                                    text: api_request.data.requester_note,
                                 })
                              }
                           >
                              {api_request.data.requester_note}
                           </Typography.Link>
                        ),
                     },
                  ]}
               />
               <OverlayControllerWithRef ref={control}>
                  <ViewDetailsDrawer getContainer={false} text={""} />
               </OverlayControllerWithRef>
            </section>

            {api_request.isSuccess && new Set([FixRequestStatus.HEAD_CONFIRM]).has(api_request.data.status) && (
               <section className="std-layout">
                  <div className="flex w-full gap-4 rounded-b-lg bg-red-800 p-3 text-white">
                     Yêu cầu này đã được hoàn thành và đang chờ xác nhận từ trưởng phòng
                  </div>
               </section>
            )}
            {api_request.isSuccess && api_request.data.status === FixRequestStatus.CLOSED && (
               <section className="std-layout">
                  <div className="flex w-full gap-2 rounded-b-lg bg-red-800 p-3 text-white">
                     <div className="font-semibold">Đánh giá</div>
                     <div>{(api_request.data as any)?.feedback?.content ?? "Không có"}</div>
                  </div>
               </section>
            )}
            {sendWarrantyTask?.status === TaskStatus.COMPLETED &&
               warrantyIssues.receive?.status === IssueStatusEnum.PENDING && (
                  <div className="mt-2 flex w-full gap-3 rounded-lg bg-red-900 p-3 text-white shadow-lg">
                     <div className="flex-shrink-0">
                        <InfoCircleFilled />
                     </div>
                     <div>
                        Thiết bị dự tính sẽ bảo hành xong vào{" "}
                        <strong>{dayjs(api_request.data.return_date_warranty).format("DD/MM/YYYY")}</strong>
                     </div>
                  </div>
               )}
            {sendWarrantyTask?.status === TaskStatus.COMPLETED &&
               (warrantyIssues.receive?.status === IssueStatusEnum.RESOLVED ||
                  warrantyIssues.receive?.status === IssueStatusEnum.FAILED) && (
                  <div className="mt-2 flex w-full gap-3 rounded-lg bg-red-900 p-3 text-white shadow-lg">
                     <div className="flex-shrink-0">
                        <InfoCircleFilled />
                     </div>
                     <div>
                        Thiết bị đã được nhận từ trung tâm bảo hành vào{" "}
                        <strong>{dayjs(receiveWarrantyTask?.fixerDate).format("DD/MM/YYYY")}</strong>
                     </div>
                  </div>
               )}
         </div>

         <Suspense fallback={<Spin />}>
            <TabbedLayout
               api_device={api_device}
               api_deviceHistory={api_deviceHistory}
               api_request={api_request}
               requestId={params.id}
            />
         </Suspense>
         <OverlayControllerWithRef ref={control_rejectRequestDrawer}>
            <Request_RejectDrawer
               onSuccess={() => {
                  router.push(hm_uris.navbar.requests + `?status=${FixRequestStatus.REJECTED}`)
               }}
            />
         </OverlayControllerWithRef>
      </div>
   )
}

export default Page
