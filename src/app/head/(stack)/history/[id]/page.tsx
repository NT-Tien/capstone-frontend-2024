"use client"

import Head_Request_All from "@/app/head/_api/request/all.api"
import DataListView from "@/common/components/DataListView"
import RootHeader from "@/common/components/RootHeader"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { NotFoundError } from "@/common/error/not-found.error"
import qk from "@/common/querykeys"
import { LeftOutlined, DeleteOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { MapPin, XCircle } from "@phosphor-icons/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Button, Card, Modal, Progress, Result, Skeleton, Steps, Tag } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { FixRequest_StatusData, FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"
import Head_Request_UpdateClose from "@/app/head/_api/request/update-close.api"
import FeedbackDrawer from "@/app/head/(stack)/history/[id]/Feedback.drawer"
import { useMemo, useState } from "react"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"
import ModalConfirm from "@/common/components/ModalConfirm"
import Head_Request_OneById from "@/app/head/_api/request/oneById.api"
import head_qk from "@/app/head/_api/qk"
import Head_Request_UpdateCancel from "@/app/head/_api/request/update-cancel.api"

export default function HistoryDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { message } = App.useApp()

   const api_requests = useQuery({
      queryKey: head_qk.requests.by_id(params.id),
      queryFn: () => Head_Request_OneById({ id: params.id }),
      retry(failureCount, error) {
         if (error instanceof NotFoundError) return false
         return failureCount < 3
      },
      refetchOnWindowFocus(query) {
         return !(query.state.error instanceof NotFoundError)
      },
   })

   const mutate_cancelRequest = useMutation({
      mutationFn: Head_Request_UpdateCancel,
      onMutate: async () => {
         message.loading({
            content: "Đang hủy báo cáo...",
            key: "cancelRequest",
         })
      },
      onSettled: () => {
         message.destroy("cancelRequest")
      },
      onError: async (error) => {
         message.error({
            content: "Đã xảy ra lỗi khi hủy báo cáo",
            key: "cancelRequest",
         })
      },
      onSuccess: async () => {
         message.success({
            content: "Đã hủy báo cáo",
            key: "cancelRequest",
         })
      },
   })

   function handleCancelRequest() {
      mutate_cancelRequest.mutate(
         { id: params.id },
         {
            onSuccess: () => {
               api_requests.refetch()
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

   return (
      <div className="std-layout">
         <RootHeader
            title="Thông tin báo cáo"
            className="std-layout-outer p-4"
            icon={<LeftOutlined />}
            onIconClick={() => router.replace("/head/history")}
            buttonProps={{
               type: "text",
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
               <section className="mt-layout">
                  <ProDescriptions
                     labelStyle={{
                        fontSize: "1rem",
                     }}
                     contentStyle={{
                        fontSize: "1rem",
                     }}
                     title={<span className="text-lg">{"Cụ thể"}</span>}
                     extra={
                        <Tag color={FixRequest_StatusMapper(api_requests.data).color}>
                           {FixRequest_StatusMapper(api_requests.data).text}
                        </Tag>
                     }
                     dataSource={api_requests.data}
                     loading={api_requests.isPending}
                     size="small"
                     columns={[
                        {
                           title: "Ngày tạo",
                           dataIndex: "createdAt",
                           render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("YYYY-MM-DD HH:mm:ss"),
                        },
                        {
                           title: "Cập nhật lần cuối",
                           dataIndex: "updatedAt",
                           render: (_, e) =>
                              e.createdAt === e.updatedAt
                                 ? "-"
                                 : dayjs(e.updatedAt).add(7, "hours").format("YYYY-MM-DD HH:mm:ss"),
                        },
                        {
                           title: "Báo cáo bởi",
                           dataIndex: ["requester", "username"],
                        },
                        {
                           title: "Ghi chú",
                           dataIndex: "requester_note",
                        },
                     ]}
                  />
               </section>
               <section className="mt-3">
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
                                                     <FeedbackDrawer onSuccess={() => api_requests.refetch()}>
                                                        {(handleOpen) => (
                                                           <Button
                                                              type="primary"
                                                              className="mt-1"
                                                              onClick={() => handleOpen(params.id)}
                                                           >
                                                              Xác nhận
                                                           </Button>
                                                        )}
                                                     </FeedbackDrawer>
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
               <section className="std-layout-outer mt-6 bg-white py-layout">
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
            </>
         )}
      </div>
   )
}
