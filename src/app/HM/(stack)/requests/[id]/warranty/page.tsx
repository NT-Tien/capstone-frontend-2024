"use client"

import HeadStaff_Device_OneById from "@/features/head-maintenance/api/device/one-byId.api"
import HeadStaff_Device_OneByIdWithHistory from "@/features/head-maintenance/api/device/one-byIdWithHistory.api"
import headstaff_qk from "@/features/head-maintenance/qk"
import HeadStaff_Request_OneById from "@/features/head-maintenance/api/request/oneById.api"
import DataListView from "@/components/DataListView"
import PageHeader from "@/components/layout/PageHeader"
import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { NotFoundError } from "@/lib/error/not-found.error"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, ConfigProvider, Dropdown } from "antd"
import Button from "antd/es/button"
import Card from "antd/es/card"
import Result from "antd/es/result"
import Spin from "antd/es/spin"
import Tag from "antd/es/tag"
import dayjs from "dayjs"
import Image from "next/image"
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
import TabbedLayout from "@/app/HM/(stack)/requests/[id]/warranty/Tabs.component"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import hm_uris from "@/features/head-maintenance/uri"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"

function Page({ params, searchParams }: { params: { id: string }; searchParams: { viewingHistory?: string } }) {
   const router = useRouter()
   const { modal } = App.useApp()

   const control_rejectRequestDrawer = useRef<RefType<Request_RejectDrawerProps> | null>(null)
   const taskDetailsRef = useRef<TaskDetailsDrawerRefType | null>(null)

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

   function handleBack() {
      if (searchParams.viewingHistory === "true") {
         router.back()
      } else {
         router.push(`/HM/requests?status=${api_request.data?.status}`)
      }
   }

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
               title={"Yêu cầu: Bảo hành"}
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
                  <div className="px-layout">
                     <section className={cn("relative z-50 rounded-lg border-2 border-neutral-200 bg-white shadow-lg")}>
                        <DataListView
                           bordered
                           dataSource={api_request.data}
                           itemClassName="py-2"
                           labelClassName="font-normal text-neutral-400 text-[14px]"
                           valueClassName="text-[14px] font-medium"
                           items={[
                              {
                                 label: "Ngày tạo",
                                 value: (e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
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
                              ...(api_request.data?.return_date_warranty
                                 ? [
                                      {
                                         label: "Ngày nhận bảo hành (dự tính)",
                                         value: (e: any) => dayjs(e.return_date_warranty).format("DD/MM/YYYY"),
                                      },
                                   ]
                                 : []),
                           ]}
                        />
                     </section>

                     {api_request.isSuccess &&
                        new Set([FixRequestStatus.HEAD_CONFIRM]).has(api_request.data.status) && (
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
                  </div>

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
            />
         </div>
      </ConfigProvider>
   )
}

export default Page
