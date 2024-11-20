"use client"

import TabbedLayout from "@/app/HM/(stack)/requests/[id]/fix/Tabs.component"
import ViewDetailsDrawer, {
   type ViewDetailsDrawerProps,
} from "@/app/HM/(stack)/requests/[id]/warranty/ViewDetails.drawer"
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
import headstaff_qk from "@/features/head-maintenance/qk"
import hm_uris from "@/features/head-maintenance/uri"
import { ReceiveWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import IssueUtil from "@/lib/domain/Issue/Issue.util"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { NotFoundError } from "@/lib/error/not-found.error"
import { cn } from "@/lib/utils/cn.util"
import { DownOutlined, InfoCircleFilled } from "@ant-design/icons"
import { Calendar, ChartDonut, Note, Swap, Truck, User } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { App, Button, Descriptions, Dropdown, Tag, Typography } from "antd"
import Card from "antd/es/card"
import Spin from "antd/es/spin"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { Suspense, useEffect, useRef } from "react"

function Page({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { modal } = App.useApp()

   const control_rejectRequestDrawer = useRef<RefType<Request_RejectDrawerProps> | null>(null)
   const taskDetailsRef = useRef<TaskDetailsDrawerRefType | null>(null)
   const control = useRef<RefType<ViewDetailsDrawerProps>>(null)

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
      select: (data) => {
         return {
            ...data,
            issues: data.issues.filter((issue) => IssueUtil.isFixIssue(issue)),
            tasks: data.tasks.filter((task) => TaskUtil.isTask_Fix(task)),
         }
      },
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

   useEffect(() => {
      if (!api_request.isSuccess) return
      if (!api_request.data.return_date_warranty) return

      const now = dayjs()
      const warrantyDate = dayjs(api_request.data.return_date_warranty).add(7, "hours")
      const returnWarrantyTask = api_request.data.issues.find(
         (issue) => issue.typeError.id === ReceiveWarrantyTypeErrorId,
      )?.task

      if (now.isAfter(warrantyDate) && returnWarrantyTask?.status === TaskStatus.AWAITING_FIXER) {
         modal.info({
            title: "Thông báo",
            content: "Thiết bị đã bảo hành xong. Vui lòng tạo tác vụ để nhận và lắp đặt thiết bị",
            okText: "Xem tác vụ",
            onOk: () => {
               taskDetailsRef.current?.handleOpen(returnWarrantyTask, params.id)
            },
            cancelText: "Đóng",
         })
      }
   }, [api_request.data, api_request.isSuccess, modal, params.id])

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
                              icon: <Truck size={16} weight="fill" />,
                              label: "Bảo hành",
                              key: "warranty",
                              onClick: () => {
                                 router.push(hm_uris.stack.requests_id_warranty(params.id))
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
                        Yêu cầu: Sửa chữa
                     </Button>
                  </Dropdown>
               ) : (
                  "Yêu cầu: Sửa chữa"
               )
            }
            nextButton={
               <Dropdown
                  menu={{
                     items: [],
                  }}
               >
                  <PageHeaderV2.InfoButton />
               </Dropdown>
            }
            className={"relative z-50"}
            type={"light"}
         />
         <div className="px-layout-half">
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
            {api_request.data?.issues.find((i) => i.task === null) && (
               <section className="std-layout">
                  <div className="flex w-full gap-2 rounded-b-lg bg-red-800 p-3 text-white">
                     <InfoCircleFilled />
                     Có {api_request.data?.issues.filter((i) => i.task === null).length} lỗi chưa có tác vụ
                  </div>
               </section>
            )}
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
         <Task_ViewDetailsDrawer
            ref={taskDetailsRef}
            refetchFn={async () => {
               await api_request.refetch()
            }}
            autoCreateTaskFn={async (warrantyDate) => {}}
         />
      </div>
   )
}

export default Page
