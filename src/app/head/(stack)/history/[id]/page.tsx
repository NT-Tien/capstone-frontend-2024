"use client"

import DataListView from "@/components/DataListView"
import RootHeader from "@/components/layout/RootHeader"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { NotFoundError } from "@/lib/error/not-found.error"
import { DeleteOutlined, LeftOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { MapPin, XCircle } from "@phosphor-icons/react"
import { Button, Card, Progress, Result, Skeleton, Steps, Tag } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { FixRequest_StatusData, FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import FeedbackDrawer from "@/features/head-department/components/overlay/Feedback.drawer"
import { useMemo } from "react"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import ModalConfirm from "@/old/ModalConfirm"
import useRequest_OneByIdQuery from "@/features/head-department/queries/Request_OneById.query"
import useCancelRequestMutation from "@/features/head-department/mutations/CancelRequest.mutation"
import PageHeader from "@/components/layout/PageHeader"
import Image from "next/image"
import head_department_mutations from "@/features/head-department/mutations"

export default function HistoryDetails({
   params,
   searchParams,
}: {
   params: { id: string }
   searchParams: { return?: "scan"; viewingHistory?: string }
}) {
   const router = useRouter()

   const api_requests = useRequest_OneByIdQuery({ id: params.id })
   const mutate_cancelRequest = head_department_mutations.request.cancelRequest()

   function handleCancelRequest() {
      mutate_cancelRequest.mutate(
         { id: params.id },
         {
            onSuccess: async () => {
               await api_requests.refetch()
            },
         },
      )
   }

   const percentFinished = useMemo(() => {
      if (!api_requests.isSuccess) return 0
      return Math.floor(
         (api_requests.data.issues.reduce((acc, prev) => {
            return acc + (prev.status === IssueStatusEnum.RESOLVED ? 1 : 0)
         }, 0) *
            100) /
            api_requests.data.issues?.length,
      )
   }, [api_requests.data?.issues, api_requests.isSuccess])

   function handleBack() {
      if (searchParams.viewingHistory === "true") {
         router.back()
      } else {
         router.push(`/head/history?status=${api_requests.data?.status}`)
      }
   }

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
            <>
               <section className="relative z-50 rounded-lg border-2 border-neutral-200 bg-white shadow-lg">
                  <h2 className="mb-2 mt-2 px-layout text-lg font-semibold">
                     <Skeleton paragraph={false} active={api_requests.isPending} loading={api_requests.isPending}>
                        Thông tin yêu cầu
                     </Skeleton>
                  </h2>
                  <DataListView
                     bordered
                     dataSource={api_requests.data}
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
                        {
                           isDivider: true,
                           label: "",
                           value: () => null,
                        },
                     ]}
                  />
                  <h2 className="mb-2 px-layout text-lg font-semibold">
                     <Skeleton paragraph={false} active={api_requests.isPending} loading={api_requests.isPending}>
                        Chi tiết thiết bị
                     </Skeleton>
                  </h2>
                  <DataListView
                     dataSource={api_requests.data?.device}
                     bordered
                     itemClassName="py-2"
                     labelClassName="font-normal text-neutral-500 text-base"
                     valueClassName="text-base"
                     items={[
                        {
                           label: "Mẫu máy",
                           value: (s) => s.machineModel?.name,
                        },
                        {
                           label: "Khu vực",
                           value: (s) => s.area?.name,
                        },
                        {
                           label: "Vị trí (x, y)",
                           value: (s) => (
                              <a className="flex items-center gap-1">
                                 {s.positionX} x {s.positionY}
                                 <MapPin size={16} weight="fill" />
                              </a>
                           ),
                        },
                        {
                           label: "Mô tả",
                           value: (s) => s.description,
                        },
                     ]}
                  />
               </section>
               <section className="relative z-50 mt-3 rounded-lg border-2 border-neutral-200 bg-white shadow-lg">
                  <h2 className="mb-2 mt-2 px-layout text-lg font-semibold">
                     <Skeleton paragraph={false} active={api_requests.isPending} loading={api_requests.isPending}>
                        Tiến độ công việc
                     </Skeleton>
                  </h2>
                  <Card size="small" loading={api_requests.isPending}>
                     <Steps
                        size="small"
                        direction="vertical"
                        current={FixRequest_StatusMapper(api_requests.data).index}
                        status={api_requests.data?.status === FixRequestStatus.REJECTED ? "error" : "process"}
                        className="std-steps"
                        items={[
                           {
                              title: FixRequest_StatusData("pending").text,
                              description:
                                 api_requests.data?.status === FixRequest_StatusData("pending").statusEnum ? (
                                    <div className="space-y-2">
                                       <div>{FixRequest_StatusData("pending").description}</div>
                                       <ModalConfirm
                                          type="warning"
                                          description="Bạn có chắc chắn muốn hủy báo cáo này?"
                                          confirmProps={{
                                             type: "primary",
                                             className: "bg-yellow-500",
                                          }}
                                          confirmText="Đồng ý"
                                          cancelText="Quay lại"
                                          onConfirm={handleCancelRequest}
                                       >
                                          <Button danger icon={<DeleteOutlined />}>
                                             Hủy báo cáo
                                          </Button>
                                       </ModalConfirm>
                                    </div>
                                 ) : null,
                              className: "text-base",
                           },
                           ...(api_requests.isSuccess
                              ? !FixRequest_StatusData("rejected").conditionFn(api_requests.data) &&
                                !FixRequest_StatusData("head_cancel").conditionFn(api_requests.data)
                                 ? [
                                      {
                                         title: FixRequest_StatusData("approved").text,
                                         description:
                                            api_requests.data?.status === FixRequest_StatusData("approved").statusEnum
                                               ? FixRequest_StatusData("approved").description
                                               : null,
                                         className: "text-base",
                                      },
                                      {
                                         title: FixRequest_StatusData("in_progress").text,
                                         description:
                                            api_requests.data?.status ===
                                            FixRequest_StatusData("in_progress").statusEnum ? (
                                               <div>
                                                  {FixRequest_StatusData("in_progress").description}
                                                  <Progress percent={percentFinished} />
                                               </div>
                                            ) : null,
                                         className: "text-base",
                                      },
                                      {
                                         title: FixRequest_StatusData("head_confirm").text,
                                         description:
                                            api_requests.data?.status ===
                                            FixRequest_StatusData("head_confirm").statusEnum ? (
                                               <div>
                                                  {FixRequest_StatusData("head_confirm").description}
                                                  {api_requests.data?.status === FixRequestStatus.HEAD_CONFIRM && (
                                                     <div>
                                                        <FeedbackDrawer onSuccess={() => api_requests.refetch()}>
                                                           {(handleOpen) => (
                                                              <Button
                                                                 type="primary"
                                                                 className="mt-1"
                                                                 onClick={() => handleOpen(params.id)}
                                                              >
                                                                 Đánh giá
                                                              </Button>
                                                           )}
                                                        </FeedbackDrawer>
                                                     </div>
                                                  )}
                                               </div>
                                            ) : null,
                                         className: "text-base",
                                      },
                                      {
                                         title: FixRequest_StatusData("closed").text,
                                         description:
                                            api_requests.data?.status === FixRequest_StatusData("closed").statusEnum
                                               ? FixRequest_StatusData("closed").description
                                               : null,
                                         className: "text-base",
                                      },
                                   ]
                                 : FixRequest_StatusData("head_cancel").conditionFn(api_requests.data)
                                   ? [
                                        {
                                           title: FixRequest_StatusData("head_cancel").text,
                                           description:
                                              api_requests.data?.status ===
                                              FixRequest_StatusData("head_cancel").statusEnum
                                                 ? FixRequest_StatusData("head_cancel").description
                                                 : null,
                                           className: "text-base",
                                        },
                                     ]
                                   : [
                                        {
                                           title: FixRequest_StatusData("rejected").text,
                                           description:
                                              api_requests.data?.status === FixRequest_StatusData("rejected").statusEnum
                                                 ? FixRequest_StatusData("rejected").description
                                                 : null,
                                           className: "text-base",
                                        },
                                     ]
                              : []),
                        ]}
                     />
                  </Card>
               </section>
               {api_requests.data?.status === FixRequestStatus.REJECTED && (
                  <section className="mt-3 w-full">
                     <Card
                        title={
                           <div className="flex items-center gap-1">
                              <XCircle size={18} />
                              Lý do
                           </div>
                        }
                        size="small"
                     >
                        {api_requests.data?.checker_note}
                     </Card>
                  </section>
               )}
            </>
         )}
      </div>
   )
}
