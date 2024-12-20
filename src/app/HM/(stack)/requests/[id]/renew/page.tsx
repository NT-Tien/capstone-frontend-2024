"use client"

import HeadStaff_Device_OneById from "@/features/head-maintenance/api/device/one-byId.api"
import HeadStaff_Device_OneByIdWithHistory from "@/features/head-maintenance/api/device/one-byIdWithHistory.api"
import headstaff_qk from "@/features/head-maintenance/qk"
import HeadStaff_Request_OneById from "@/features/head-maintenance/api/request/oneById.api"
import DataListView from "@/components/DataListView"
import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { NotFoundError } from "@/lib/error/not-found.error"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, ConfigProvider, Descriptions, Dropdown } from "antd"
import Button from "antd/es/button"
import Card from "antd/es/card"
import Result from "antd/es/result"
import Spin from "antd/es/spin"
import Tag from "antd/es/tag"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { Suspense, useEffect, useMemo, useRef } from "react"
import { ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import { cn } from "@/lib/utils/cn.util"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import HeadStaff_Task_Create from "@/features/head-maintenance/api/task/create.api"
import HeadStaff_Task_Update from "@/features/head-maintenance/api/task/update.api"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Request_RejectDrawer, {
   Request_RejectDrawerProps,
} from "@/features/head-maintenance/components/overlays/Request_Reject.drawer"
import Task_ViewDetailsDrawer, {
   TaskDetailsDrawerRefType,
} from "@/features/head-maintenance/components/overlays/Task_ViewDetails.drawer"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import hm_uris from "@/features/head-maintenance/uri"
import { DownOutlined, InfoCircleFilled } from "@ant-design/icons"
import { NewDeviceInstallation, RemoveOldDeviceTypeErrorId } from "@/lib/constants/Renew"
import TabbedLayout from "./Tabs.component"
import qk from "@/old/querykeys"
import HeadStaff_Task_OneById from "@/features/head-maintenance/api/task/one-byId.api"
import HeadStaff_Request_RenewStatus from "@/features/head-maintenance/api/request/renew-status.api"
import { Truck, Wrench } from "@phosphor-icons/react"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"

function Page({ params, searchParams }: { params: { id: string }; searchParams: { "prev-request"?: string } }) {
   const router = useRouter()
   const { modal, notification, message } = App.useApp()

   const control_rejectRequestDrawer = useRef<RefType<Request_RejectDrawerProps> | null>(null)
   const taskDetailsRef = useRef<TaskDetailsDrawerRefType | null>(null)

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

   const api_task = useQuery({
      queryKey: headstaff_qk.task.byId(api_request.data?.tasks[0].id ?? ""),
      queryFn: () => HeadStaff_Task_OneById({ id: api_request.data?.tasks[0].id ?? "" }),
      enabled: api_request.isSuccess
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

   const api_device_renew = useQuery({
      queryKey: headstaff_qk.request.renewStatus(api_request.data?.tasks[0].id ?? ""),
      queryFn: () => HeadStaff_Request_RenewStatus({ id: api_request.data?.tasks[0].id ?? "" }),
      enabled: api_request.isSuccess
   })

   const mutate_createTask = useMutation({
      mutationFn: HeadStaff_Task_Create,
   })

   const mutate_updateTaskStatus = useMutation({
      mutationFn: HeadStaff_Task_Update,
   })

   const mutate_closeRequest = head_maintenance_mutations.request.finish()

   const isWarranty = useMemo(() => {
      return api_request.data?.issues.find(
         (issue) => issue.typeError.id === SendWarrantyTypeErrorId || issue.typeError.id === ReceiveWarrantyTypeErrorId,
      )
   }, [api_request.data])

   const isRenew = useMemo(() => {
      return api_request.data?.issues.find(
         (issue) => issue.typeError.id === RemoveOldDeviceTypeErrorId || issue.typeError.id === NewDeviceInstallation,
      )
   }, [api_request.data])

   function handleBack() {
      if (searchParams["prev-request"]) {
         router.push(hm_uris.stack.requests_id(searchParams["prev-request"]))
      } else {
         router.push(hm_uris.navbar.requests_query({ status: api_request.data?.status }))
      }
   }

   async function handleAutoCreateWarrantyTask(returnDate?: string) {
      try {
         console.log("Test")
         if (!api_request.isSuccess) {
            console.log("Failed 1")
            return
         }
         const issue = api_request.data.issues.find((issue) => issue.typeError.id === ReceiveWarrantyTypeErrorId)
         if (!issue) {
            console.log("Failed 2")
            return
         }
         console.log("Reacted herer")

         // check if already has warranty task
         if (issue.task !== null) {
            console.log("Failed 3")
            return
         }

         const task = await mutate_createTask.mutateAsync({
            issueIDs: [issue.id],
            name: `${dayjs(api_request.data.createdAt).add(7, "hours").format("DDMMYY")}_${api_request.data.device.area.name}_${api_request.data.device.machineModel.name}_Lắp máy bảo hành`,
            operator: 0,
            priority: false,
            request: api_request.data.id,
            totalTime: issue.typeError.duration,
            fixerDate: returnDate ?? api_request.data.return_date_warranty ?? undefined,
         })

         console.log("stuff")

         const taskUpdate = await mutate_updateTaskStatus.mutateAsync({
            id: task.id,
            payload: {
               status: TaskStatus.AWAITING_FIXER,
            },
         })

         api_request.refetch()
      } catch (error) {
         console.error(error)
         message.error("Có lỗi xảy ra khi tạo tác vụ bảo hành, vui lòng thử lại")
      }
   }

   // useEffect(() => {
   //    if (!api_request.isSuccess) return
   //
   //    const task = api_request.data.tasks.find((task) => task.status === TaskStatus.HEAD_STAFF_CONFIRM)
   //
   //    if (!!task) {
   //       notification.destroy("head-staff-confirm")
   //       notification.info({
   //          message: "Thông báo",
   //          description: "Trên hệ thống có tác vụ đã hoàn thành và đang chờ xác nhận từ trưởng phòng",
   //          placement: "bottomRight",
   //          key: "head-staff-confirm",
   //          btn: (
   //             <Button
   //                type="primary"
   //                size="large"
   //                onClick={() => {
   //                   notification.destroy("head-staff-confirm")
   //                   taskDetailsRef.current?.handleOpen(task, params.id)
   //                }}
   //             >
   //                Xem tác vụ
   //             </Button>
   //          ),
   //       })
   //    }
   //
   //    return () => {
   //       notification.destroy("head-staff-confirm")
   //    }
   // }, [api_request.data?.tasks, api_request.isSuccess, notification, params.id])

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

   return (
      <ConfigProvider
         theme={{
            token: {
               colorPrimary: "#176b37",
            },
         }}
      >
         <div className="relative flex min-h-screen flex-col">
            <div className={"std-layout-outer absolute left-0 top-0 h-36 w-full bg-head_maintenance"} />
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
                                 label: "Sửa chữa",
                                 key: "fix",
                                 onClick: () => {
                                    router.push(hm_uris.stack.requests_id_fix(params.id))
                                 },
                              },
                              {
                                 icon: <Truck size={16} weight="fill" />,
                                 label: "Bảo hành",
                                 key: "warranty",
                                 onClick: () => {
                                    router.push(hm_uris.stack.requests_id_warranty(params.id))
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
                           Yêu cầu: Thay máy
                        </Button>
                     </Dropdown>
                  ) : (
                     "Yêu cầu: Thay máy"
                  )
               }
               nextButton={
                  <Dropdown
                     menu={{
                        items: [
                           {
                              key: "1-main",
                              label: "Hoàn tất yêu cầu",
                              onClick: () => {
                                 modal.confirm({
                                    title: "Lưu ý",
                                    content: "Bạn có chắc muốn Hoàn tất yêu cầu này?",
                                    centered: true,
                                    maskClosable: true,
                                    onOk: () => {
                                       mutate_closeRequest.mutate(
                                          {
                                             id: params.id,
                                          },
                                          {
                                             onSuccess: () => {
                                                router.push(
                                                   hm_uris.navbar.requests + `?status=${FixRequestStatus.CLOSED}`,
                                                )
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
            {api_request.isError ? (
               <>
                  {api_request.error instanceof NotFoundError ? (
                     <Card className="mx-layout">
                        <Result
                           status="404"
                           title="Không tìm thấy yêu cầu"
                           subTitle="Yêu cầu không tồn tại hoặc đã bị xóa"
                           extra={<Button onClick={handleBack}>Quay lại</Button>}
                        />
                     </Card>
                  ) : (
                     <Card className="mx-layout">
                        <Result
                           status="error"
                           title="Có lỗi xảy ra"
                           subTitle="Vui lòng thử lại sau"
                           extra={[
                              <Button onClick={handleBack} key="back">
                                 Quay lại
                              </Button>,
                              <Button onClick={() => api_request.refetch()} key="retry">
                                 Thử lại
                              </Button>,
                           ]}
                        />
                     </Card>
                  )}
               </>
            ) : (
               <>
                  <div className="px-layout-half">
                     <section
                        className={cn(
                           "relative z-50 rounded-lg border-2 border-neutral-200 bg-white p-layout-half shadow-lg",
                           isWarranty && isRenew && "rounded-b-none",
                        )}
                     >
                        {api_request.isPending && <Card loading></Card>}
                        {api_request.isSuccess && (
                           <Descriptions
                              size={"small"}
                              className={"text-sm *:text-sm"}
                              contentStyle={{
                                 display: "flex",
                                 justifyContent: "flex-end",
                                 fontSize: "14px",
                              }}
                              labelStyle={{
                                 fontSize: "14px",
                              }}
                              colon={false}
                              items={[
                                 {
                                    label: "Ngày tạo",
                                    children: dayjs(api_request.data.createdAt).format("DD/MM/YYYY - HH:mm"),
                                 },
                                 {
                                    label: "Người yêu cầu",
                                    children: api_request.data.requester?.username ?? "-",
                                 },
                                 {
                                    label: "Trạng thái",
                                    children: (
                                       <div className={FixRequest_StatusMapper(api_request.data).className}>
                                          {FixRequest_StatusMapper(api_request.data).text}
                                       </div>
                                    ),
                                 },
                                 {
                                    label: "Ghi chú",
                                    children: <div className={"line-clamp-1"}>{api_request.data.requester_note}</div>,
                                 },
                              ]}
                           />
                        )}
                     </section>
                     {api_request.data?.issues.find((i) => i.task === null) && (
                        <section className="std-layout">
                           <div className="flex w-full gap-2 rounded-b-lg bg-blue-500 p-3 text-white">
                              <InfoCircleFilled />
                              Có {api_request.data?.issues.filter((i) => i.task === null).length} lỗi chưa có tác vụ
                           </div>
                        </section>
                     )}
                     {api_request.isSuccess &&
                        new Set([FixRequestStatus.HEAD_CONFIRM]).has(api_request.data.status) && (
                           <section className="std-layout">
                              <div className="flex w-full gap-4 rounded-b-lg bg-yellow-500 p-3 text-white">
                                 Yêu cầu này đã được hoàn thành và đang chờ xác nhận từ trưởng phòng sản xuất
                              </div>
                           </section>
                        )}
                     {api_request.isSuccess && api_request.data.status === FixRequestStatus.CLOSED && (
                        <section className="std-layout">
                           <div className="flex w-full gap-2 rounded-b-lg bg-purple-500 p-3 text-white">
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
                        api_task={api_task}
                     />
                  </Suspense>
               </>
            )}
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
               autoCreateTaskFn={async (warrantyDate) => handleAutoCreateWarrantyTask(warrantyDate)}
            />
         </div>
      </ConfigProvider>
   )
}

export default Page
