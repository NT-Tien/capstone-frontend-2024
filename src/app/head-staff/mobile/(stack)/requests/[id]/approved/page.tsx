"use client"

import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import HeadStaff_Device_OneByIdWithHistory from "@/app/head-staff/_api/device/one-byIdWithHistory.api"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import DataListView from "@/components/DataListView"
import PageHeader from "@/common/components/PageHeader"
import { FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"
import { NotFoundError } from "@/common/error/not-found.error"
import { Info } from "@phosphor-icons/react"
import { MoreOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { App, Dropdown, Progress } from "antd"
import Button from "antd/es/button"
import Card from "antd/es/card"
import Result from "antd/es/result"
import Spin from "antd/es/spin"
import Tag from "antd/es/tag"
import dayjs from "dayjs"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Suspense, useEffect, useMemo, useRef } from "react"
import TabbedLayout from "./TabbedLayout.component"
import isApproved from "./is-approved.util"
import RejectRequestDrawer, { RejectRequestDrawerRefType } from "../RejectRequest.drawer"
import { ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/constants/Warranty"
import { cn } from "@/common/util/cn.util"
import TaskDetailsDrawer, { TaskDetailsDrawerRefType } from "./TaskDetails.drawer"
import { TaskStatus } from "@/common/enum/task-status.enum"

function Page({ params, searchParams }: { params: { id: string }; searchParams: { viewingHistory?: string } }) {
   const router = useRouter()
   const { modal, notification } = App.useApp()

   const rejectRequestRef = useRef<RejectRequestDrawerRefType | null>(null)
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

   const percentFinished = useMemo(() => {
      if (!api_request.isSuccess) return
      return (
         (api_request.data.issues.filter((task) => task.status !== IssueStatusEnum.PENDING).length /
            api_request.data.issues.length) *
         100
      )
   }, [api_request.data, api_request.isSuccess])

   const isWarranty = useMemo(() => {
      return api_request.data?.issues.find(
         (issue) => issue.typeError.id === SendWarrantyTypeErrorId || issue.typeError.id === ReceiveWarrantyTypeErrorId,
      )
   }, [api_request.data])

   function handleBack() {
      if (searchParams.viewingHistory === "true") {
         router.back()
      } else {
         router.push(`/head-staff/mobile/requests?status=${api_request.data?.status}`)
      }
   }

   useEffect(() => {
      if (api_request.isSuccess && !isApproved(api_request.data.status)) {
         router.push(`/head-staff/mobile/requests/${params.id}`)
      }
   }, [api_request.data, api_request.isSuccess, params.id, router])

   useEffect(() => {
      if (!api_request.isSuccess) return

      const task = api_request.data.tasks.find((task) => task.status === TaskStatus.HEAD_STAFF_CONFIRM)

      if (!!task) {
         notification.destroy("head-staff-confirm")
         notification.info({
            message: "Thông báo",
            description: "Trên hệ thống có tác vụ đã hoàn thành và đang chờ xác nhận từ trưởng phòng",
            placement: "bottomRight",
            key: "head-staff-confirm",
            btn: (
               <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                     notification.destroy("head-staff-confirm")
                     taskDetailsRef.current?.handleOpen(task)
                  }}
               >
                  Xem tác vụ
               </Button>
            ),
         })
      }

      return () => {
         notification.destroy("head-staff-confirm")
      }
   }, [api_request.data?.tasks, api_request.isSuccess, notification])

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
               taskDetailsRef.current?.handleOpen(returnWarrantyTask)
            },
            cancelText: "Đóng",
         })
      }
   }, [api_request.data, api_request.isSuccess, modal])

   return (
      <div className="std-layout relative h-max min-h-full bg-white pb-24">
         <PageHeader
            title={searchParams.viewingHistory === "true" ? "Quay Lại | Yêu cầu" : "Yêu cầu"}
            handleClickIcon={handleBack}
            icon={PageHeader.BackIcon}
            className="std-layout-outer relative z-30"
         />
         <Image
            className="std-layout-outer absolute h-32 w-full object-cover opacity-40"
            src="/images/requests.jpg"
            alt="image"
            width={784}
            height={100}
            style={{
               WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
            }}
         />
         {api_request.isError ? (
            <>
               {api_request.error instanceof NotFoundError ? (
                  <Card>
                     <Result
                        status="404"
                        title="Không tìm thấy yêu cầu"
                        subTitle="Yêu cầu không tồn tại hoặc đã bị xóa"
                        extra={<Button onClick={handleBack}>Quay lại</Button>}
                     />
                  </Card>
               ) : (
                  <Card>
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
               <section
                  className={cn(
                     "relative z-50 rounded-lg border-2 border-neutral-200 bg-white shadow-lg",
                     isWarranty && "rounded-b-none",
                  )}
               >
                  <DataListView
                     bordered
                     dataSource={api_request.data}
                     itemClassName="py-2"
                     labelClassName="font-normal text-neutral-400 text-[14px]"
                     valueClassName="text-[14px] font-medium"
                     items={[
                        {
                           label: "Ngày tạo",
                           value: (e) => dayjs(e.createdAt).add(7, "hours").format("DD/MM/YYYY - HH:mm"),
                        },
                        {
                           label: "Người yêu cầu",
                           value: (e) => e.requester?.username ?? "-",
                        },
                        {
                           label: "Trạng thái",
                           value: (e) => (
                              <Tag className="m-0" color={FixRequest_StatusMapper(e).colorInverse}>
                                 {FixRequest_StatusMapper(e).text}
                              </Tag>
                           ),
                        },
                        {
                           label: "Ghi chú",
                           value: (e) => e.requester_note,
                        },
                     ]}
                  />
               </section>
               {isWarranty && (
                  <div className="rounded-b-lg border-[2px] border-yellow-400 bg-yellow-50 py-2 text-center font-medium text-yellow-600">
                     Thiết bị được bảo hành
                  </div>
               )}
               {api_request.data?.status === FixRequestStatus.APPROVED && api_request.data?.tasks.length === 0 && (
                  <section className="std-layout">
                     <div className="flex w-full items-start rounded-b-lg bg-primary-500 p-3 text-white">
                        <Info size={32} className="mr-2" />
                        <div className="text-sm font-medium">
                           Yêu cầu đã được xác nhận. Vui lòng tạo tác vụ để tiếp tục.
                        </div>
                     </div>
                  </section>
               )}
               {api_request.isSuccess &&
                  api_request.data.tasks.length > 0 &&
                  new Set([FixRequestStatus.APPROVED, FixRequestStatus.IN_PROGRESS]).has(api_request.data.status) && (
                     <section className="std-layout">
                        <div className="flex w-full gap-4 rounded-b-lg bg-blue-600 p-3 text-white">
                           <div className="flex flex-grow flex-col items-start">
                              <div className="flex w-full justify-between">
                                 <h5 className="font-semibold text-neutral-100">Phần trăm hoàn thành </h5>
                                 <div className="font-semibold text-neutral-100">{percentFinished}%</div>
                              </div>
                              <Progress
                                 size={"default"}
                                 status="active"
                                 strokeColor="rgba(255, 255, 255, 0.8)"
                                 showInfo={false}
                                 type="line"
                                 percent={percentFinished}
                              />
                           </div>
                           <div className="grid place-items-center">
                              <Dropdown
                                 menu={{
                                    items: [
                                       {
                                          key: "cancel-request",
                                          label: "Hủy yêu cầu",
                                          danger: true,
                                          onClick: () => {
                                             rejectRequestRef.current?.handleOpen({
                                                request: api_request.data,
                                             })
                                          },
                                       },
                                    ],
                                 }}
                              >
                                 <Button icon={<MoreOutlined />} />
                              </Dropdown>
                           </div>
                        </div>
                     </section>
                  )}

               {api_request.isSuccess && new Set([FixRequestStatus.HEAD_CONFIRM]).has(api_request.data.status) && (
                  <section className="std-layout">
                     <div className="flex w-full gap-4 rounded-b-lg bg-yellow-500 p-3 text-white">
                        Yêu cầu này đã được hoàn thành và đang chờ xác nhận từ trưởng phòng
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

               <Suspense fallback={<Spin />}>
                  <TabbedLayout
                     api_device={api_device}
                     api_deviceHistory={api_deviceHistory}
                     api_request={api_request}
                     requestId={params.id}
                  />
               </Suspense>
            </>
         )}
         <RejectRequestDrawer
            ref={rejectRequestRef}
            onSuccess={() => {
               router.push(`/head-staff/mobile/requests/${params.id}`)
            }}
         />
         <TaskDetailsDrawer
            ref={taskDetailsRef}
            refetchFn={async () => {
               await api_request.refetch()
            }}
            autoCreateTaskFn={async () => {}}
         />
      </div>
   )
}

export default Page
