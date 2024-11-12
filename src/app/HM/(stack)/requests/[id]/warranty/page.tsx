"use client"

import TabbedLayout from "@/app/HM/(stack)/requests/[id]/warranty/Tabs.component"
import ViewDetailsDrawer, { ViewDetailsDrawerProps } from "@/app/HM/(stack)/requests/[id]/warranty/ViewDetails.drawer"
import ClickableArea from "@/components/ClickableArea"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
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
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import { NotFoundError } from "@/lib/error/not-found.error"
import { cn } from "@/lib/utils/cn.util"
import { DownOutlined, UpOutlined } from "@ant-design/icons"
import { Calendar, ChartDonut, Note, User } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { App, ConfigProvider, Descriptions, Dropdown, Typography } from "antd"
import Button from "antd/es/button"
import Card from "antd/es/card"
import Result from "antd/es/result"
import Spin from "antd/es/spin"
import Tag from "antd/es/tag"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { Suspense, useRef } from "react"

function Page({ params, searchParams }: { params: { id: string }; searchParams: { viewingHistory?: string } }) {
   const router = useRouter()
   const { modal } = App.useApp()

   const control_rejectRequestDrawer = useRef<RefType<Request_RejectDrawerProps> | null>(null)
   const taskDetailsRef = useRef<TaskDetailsDrawerRefType | null>(null)
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
                     <section
                        className={cn(
                           "relative z-50 overflow-hidden rounded-lg border-2 border-neutral-200 bg-white p-layout-half shadow-lg",
                        )}
                     >
                        {api_request.isSuccess ? (
                           <>
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
                                          <Tag
                                             className="m-0"
                                             color={FixRequest_StatusMapper(api_request.data).colorInverse}
                                          >
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
                           </>
                        ) : (
                           <>
                              {api_request.isPending && (
                                 <div className="grid h-48 w-full place-items-center">
                                    <Spin />
                                 </div>
                              )}
                           </>
                        )}
                     </section>

                     {/* TEMPORARY CODE
                     {api_request.data?.issues
                        .filter((i) => !SystemRenewTypeErrorIds.has(i.typeError.id))
                        .every((i) => i.status === IssueStatusEnum.RESOLVED) && (
                        <section className="std-layout">
                           <div className="flex w-full justify-between gap-4 rounded-b-lg bg-neutral-500 p-3 text-white">
                              <p>Tất cả các lỗi đã được sửa</p>
                              <Button size="small">Đóng yêu cầu</Button>
                           </div>
                        </section>
                     )} */}
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
