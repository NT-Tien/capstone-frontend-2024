"use client"

import DataListView from "@/components/DataListView"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { NotFoundError } from "@/lib/error/not-found.error"
import { DeleteOutlined } from "@ant-design/icons"
import { ChatDots, MapPin, XCircle } from "@phosphor-icons/react"
import { App, Button, Card, Descriptions, Divider, Dropdown, Progress, Result, Skeleton, Steps } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { FixRequest_StatusData, FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import FeedbackDrawer, { FeedbackDrawerProps } from "@/features/head-department/components/overlay/Feedback.drawer"
import { useMemo, useRef } from "react"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import ModalConfirm from "@/old/ModalConfirm"
import useRequest_OneByIdQuery from "@/features/head-department/queries/Request_OneById.query"
import head_department_mutations from "@/features/head-department/mutations"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import hd_uris from "@/features/head-department/uri"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import RequestStatusTag from "@/features/head-department/components/RequestStatusTag"
import ClickableArea from "@/components/ClickableArea"

function Page({ params }: { params: { id: string } }) {
   const { modal } = App.useApp()
   const router = useRouter()

   const control_feedbackDrawer = useRef<RefType<FeedbackDrawerProps>>(null)

   const api_requests = useRequest_OneByIdQuery({ id: params.id })

   const mutate_cancelRequest = head_department_mutations.request.cancelRequest()

   function handleCancelRequest(requestId: string) {
      mutate_cancelRequest.mutate(
         { id: requestId },
         {
            onSuccess: async () => {
               await api_requests.refetch()
            },
         },
      )
   }

   return (
      <div className="std-layout relative h-max min-h-full bg-white pb-layout">
         <div className={"std-layout-outer fixed left-0 top-0 h-screen w-full bg-head_department"} />
         <PageHeaderV2
            prevButton={<PageHeaderV2.BackButton onClick={router.back} />}
            title={"Chi tiết Yêu cầu"}
            nextButton={
               <Dropdown
                  menu={{
                     items: [
                        {
                           label: "Hủy yêu cầu",
                           key: "head-cancel",
                           className: api_requests.data?.status === FixRequestStatus.PENDING ? "block" : "hidden",
                           danger: true,
                           onClick: () => {
                              modal.confirm({
                                 title: "Lưu ý",
                                 content: "Bạn có chắc muốn hủy yêu cầu này?",
                                 type: "warning",
                                 okText: "Hủy yêu cầu",
                                 okButtonProps: {
                                    danger: true,
                                 },
                                 cancelText: "Đóng",
                                 centered: true,
                                 maskClosable: true,
                                 closable: true,
                                 onOk: () => {
                                    handleCancelRequest(params.id)
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
         />
         {api_requests.isError ? (
            api_requests.error instanceof NotFoundError ? (
               <Card size="small" className="mt-layout">
                  <Result
                     status="error"
                     title="Đã xảy ra lỗi"
                     subTitle="Không tìm thấy báo cáo này trên hệ thống"
                     extra={
                        <div className="space-x-3">
                           <Button type="text" onClick={() => router.replace("/head/history")}>
                              Quay lại
                           </Button>
                           <Button
                              type="primary"
                              onClick={() => api_requests.refetch()}
                              loading={api_requests.isPending}
                           >
                              Thử lại
                           </Button>
                        </div>
                     }
                  />
               </Card>
            ) : (
               <Card size="small" className="mt-layout">
                  <Result
                     status="error"
                     title="Đã xảy ra lỗi"
                     subTitle="Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau"
                     extra={
                        <div className="space-x-3">
                           <Button type="text" onClick={() => router.replace("/head/history")}>
                              Quay lại
                           </Button>
                           <Button
                              type="primary"
                              onClick={() => api_requests.refetch()}
                              loading={api_requests.isPending}
                           >
                              Thử lại
                           </Button>
                        </div>
                     }
                  />
               </Card>
            )
         ) : (
            <article className={"relative z-50"}>
               <section className={"mb-2"}>
                  {api_requests.data?.status === FixRequestStatus.REJECTED && (
                     <section className="flex items-center gap-2 rounded-lg border-2 border-red-200 bg-red-500 px-layout-half py-2 text-white shadow-lg">
                        <div>
                           <XCircle size={36} />
                        </div>
                        <div>
                           <h2 className="text-lg font-semibold">Yêu cầu này đã bị từ chối</h2>
                           Lý do: {api_requests.data?.checker_note ?? "Không có"}
                        </div>
                     </section>
                  )}
                  {api_requests.data?.status === FixRequestStatus.HEAD_CONFIRM && (
                     <ClickableArea
                        className="w-full justify-start gap-0 bg-orange-500"
                        onClick={() =>
                           control_feedbackDrawer.current?.handleOpen({
                              requestId: params.id,
                           })
                        }
                     >
                        <div className={"rounded-md p-3 pr-4 text-white shadow-sm"}>
                           <ChatDots size={36} />
                        </div>
                        <div className={"flex flex-col items-start p-2 pl-0 text-white"}>
                           <h2 className={"text-base font-semibold"}>Yêu cầu đã hoàn thành</h2>
                           <span className={"text-sm"}>Vui lòng đánh giá quá trình sửa chữa</span>
                        </div>
                     </ClickableArea>
                  )}
               </section>
               <section className="rounded-lg border-2 border-neutral-200 bg-white py-2 shadow-lg">
                  {api_requests.isPending && <Card loading />}
                  {api_requests.isSuccess && (
                     <>
                        <Descriptions
                           className="p-layout-half"
                           contentStyle={{
                              display: "flex",
                              justifyContent: "end",
                           }}
                           colon={false}
                           items={[
                              {
                                 label: "Ngày tạo",
                                 children: dayjs(api_requests.data?.createdAt).format("DD/MM/YYYY - HH:mm"),
                              },
                              {
                                 label: "Trạng thái",
                                 children: <RequestStatusTag status={api_requests.data?.status} />,
                              },
                              {
                                 label: "Ghi chú",
                                 children: api_requests.data?.requester_note,
                                 span: 2,
                              },
                           ]}
                        />
                        <Divider className="my-2"></Divider>
                        <Descriptions
                           className="p-layout-half"
                           contentStyle={{
                              display: "flex",
                              justifyContent: "end",
                           }}
                           colon={false}
                           items={[
                              {
                                 label: "Mẫu máy",
                                 children: api_requests.data?.device?.machineModel?.name,
                              },
                              {
                                 label: "Vị trí",
                                 children: `Khu vực ${api_requests.data?.device?.area?.name} (${api_requests.data?.device?.positionX ?? "x"}, ${api_requests.data?.device?.positionY ?? "y"})`,
                              },
                           ]}
                        />
                     </>
                  )}
               </section>
               <section className="mt-3 rounded-lg border-2 border-neutral-200 bg-white shadow-lg">
                  <Card size="small" loading={api_requests.isPending} title={"Tiến độ công việc"}>
                     <Steps
                        size="small"
                        direction="vertical"
                        current={(function () {
                           switch (api_requests.data?.status) {
                              case FixRequestStatus.PENDING:
                                 return 0
                              case FixRequestStatus.APPROVED:
                              case FixRequestStatus.IN_PROGRESS:
                                 return 3
                              case FixRequestStatus.HEAD_CONFIRM:
                                 return 4
                              case FixRequestStatus.CLOSED:
                                 return 5
                              case FixRequestStatus.HEAD_CANCEL:
                                 return 2
                              case FixRequestStatus.REJECTED:
                                 return 1
                           }
                        })()}
                        status={api_requests.data?.status === FixRequestStatus.REJECTED ? "error" : "process"}
                        className="std-steps"
                        items={[
                           {
                              title: "Chưa xử lý",
                              description: <span className={"text-sm"}>Yêu cầu chưa được xử lý</span>,
                           },
                           {
                              title: "Đã Từ chối",
                              description: <span className={"text-sm"}>Yêu cầu đã bị từ chối</span>,
                              className: api_requests.data?.status === FixRequestStatus.REJECTED ? "" : "hidden",
                           },
                           {
                              title: "Đã hủy",
                              description: <span className={"text-sm"}>Yêu cầu đã bị bạn hủy</span>,
                              className: api_requests.data?.status === FixRequestStatus.HEAD_CANCEL ? "" : "hidden",
                           },
                           {
                              title: "Đang sửa chữa",
                              description: <span className={"text-sm"}>Đang sửa chữa thiết bị</span>,
                              className:
                                 api_requests.isSuccess &&
                                 new Set([FixRequestStatus.REJECTED, FixRequestStatus.HEAD_CANCEL]).has(
                                    api_requests.data.status,
                                 )
                                    ? "hidden"
                                    : "",
                           },

                           {
                              title: "Chờ đánh giá",
                              description: <span className={"text-sm"}>Yêu cầu đã hoàn thành và chờ đánh giá</span>,
                              className:
                                 api_requests.isSuccess &&
                                 new Set([FixRequestStatus.REJECTED, FixRequestStatus.HEAD_CANCEL]).has(
                                    api_requests.data.status,
                                 )
                                    ? "hidden"
                                    : "",
                           },
                           {
                              title: "Đóng",
                              description: <span className={"text-sm"}>Yêu cầu đã được đóng</span>,
                              className:
                                 api_requests.isSuccess &&
                                 new Set([FixRequestStatus.REJECTED, FixRequestStatus.HEAD_CANCEL]).has(
                                    api_requests.data.status,
                                 )
                                    ? "hidden"
                                    : "",
                           },
                        ]}
                     />
                  </Card>
               </section>
            </article>
         )}
         <OverlayControllerWithRef ref={control_feedbackDrawer}>
            <FeedbackDrawer
               onSuccess={() => router.push(`${hd_uris.navbar.history}?status=${"closed" as FixRequestStatuses}`)}
            />
         </OverlayControllerWithRef>
      </div>
   )
}

export default Page
