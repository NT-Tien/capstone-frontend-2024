"use client"

import VerifyTaskModal from "@/app/head-staff/mobile/(stack)/tasks/[id]/VerifyTask.modal"
import DataListView from "@/common/components/DataListView"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import { LinkOutlined, UserOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { MapPin } from "@phosphor-icons/react"
import { useMutation, UseQueryResult } from "@tanstack/react-query"
import { App, Avatar, Button, Card, Image, Steps, Tag } from "antd"
import dayjs from "dayjs"
import Link from "next/link"
import { clientEnv } from "@/env"
import { useRef } from "react"
import HeadStaff_Task_Update from "@/app/head-staff/_api/task/update.api"
import HeadStaff_Task_UpdateComplete from "@/app/head-staff/_api/task/update-complete.api"

type Props = {
   api: UseQueryResult<TaskDto, Error>
   setTab: (tab: string) => void
}

function TaskStatusNumberMapper(task?: TaskDto) {
   if (!task) return 0

   if (task.confirmReceipt === true && task.status === TaskStatus.ASSIGNED) {
      return 2
   }

   switch (task.status) {
      case TaskStatus.AWAITING_FIXER:
         return 0
      case TaskStatus.ASSIGNED:
         return 1
      case TaskStatus.IN_PROGRESS:
         return 3
      case TaskStatus.HEAD_STAFF_CONFIRM:
         return 4
      case TaskStatus.COMPLETED:
         return 5
      default:
         return 0
   }
}

export default function DetailsTab({ api, setTab }: Props) {
   const { message } = App.useApp()
   const verifyRef = useRef<HTMLDivElement | null>(null)

   const mutate_updateStatus = useMutation({
      mutationFn: HeadStaff_Task_UpdateComplete,
      onSuccess: async () => {
         message.success("Xác nhận thành công")
      },
      onMutate: async () => {
         message.destroy("loading")
         message.loading({
            content: "Đang xác nhận...",
            key: "loading",
         })
      },
      onSettled: () => {
         message.destroy("loading")
      },
      onError: async () => {
         message.error("Xác nhận thất bại")
      },
   })

   function handleUpdateConfirmCheck() {
      if (!api.isSuccess) return

      mutate_updateStatus.mutate(
         {
            id: api.data.id,
         },
         {
            onSuccess: async () => {
               await api.refetch()
            },
         },
      )
   }

   return (
      <section>
         <ProDescriptions
            className="mt-3"
            title="Chi tiết tác vụ"
            extra={
               <Tag color={TaskStatusTagMapper[String(api.data?.status)].colorInverse}>
                  {TaskStatusTagMapper[String(api.data?.status)].text}
               </Tag>
            }
            dataSource={api.data}
            loading={api.isLoading}
            size="small"
            columns={[
               {
                  key: "name",
                  label: "Tên tác vụ",
                  dataIndex: "name",
               },
               {
                  key: "priority",
                  label: "Mức độ ưu tiên",
                  render: (_, e) => (e.priority ? <Tag color="red">Cao</Tag> : <Tag color="green">Thấp</Tag>),
               },
               {
                  key: "totalTime",
                  label: "Tổng thời lượng",
                  render: (_, e) => e.totalTime + " phút",
               },
               {
                  key: "operator",
                  label: "Thông số kỹ thuật",
                  dataIndex: "operator",
               },
               {
                  key: "created",
                  label: "Ngày tạo",
                  dataIndex: "createdAt",
                  render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("DD/MM/YYYY - HH:mm"),
               },
               {
                  key: "request",
                  label: "Yêu cầu gốc",
                  render: (_, e) => (
                     <Link href={`/head-staff/mobile/requests/${e.request.id}`} prefetch>
                        {e.request.requester_note}
                        <LinkOutlined className="ml-1" />
                     </Link>
                  ),
               },
            ]}
         />
         <Card
            size="small"
            className="mt-3"
            classNames={{
               body: "flex",
            }}
         >
            <Avatar icon={<UserOutlined />} />
            <div className="ml-3">
               <div className="text-base font-semibold">{api.data?.fixer.username}</div>
               <div className="text-xs">{api.data?.fixer.phone}</div>
            </div>
         </Card>
         <section className="mt-3">
            <Card>
               <Steps
                  current={TaskStatusNumberMapper(api.data) ?? 0}
                  direction="vertical"
                  items={[
                     {
                        title: TaskStatusTagMapper[TaskStatus.AWAITING_FIXER].text,
                        description: "Chờ phân công nhân viên",
                     },
                     {
                        title: TaskStatusTagMapper[TaskStatus.ASSIGNED].text,
                        description: "Đã phân công nhân viên, chờ nhân viên bắt đầu",
                     },
                     ...(api.data?.issues.find((i) => i.issueSpareParts.length !== 0)
                        ? [
                             {
                                title: "Đã lấy linh kiện",
                                description: "Nhân viên đã lấy linh kiện",
                             },
                          ]
                        : []),
                     {
                        title: TaskStatusTagMapper[TaskStatus.IN_PROGRESS].text,
                        description: "Nhân viên đã bắt đầu thực hiện tác vụ",
                     },
                     {
                        title: TaskStatusTagMapper[TaskStatus.HEAD_STAFF_CONFIRM].text,
                        description: (
                           <div className="flex items-center gap-2">
                              <span>Chờ xác nhận từ trưởng phòng</span>
                              <Button
                                 size="small"
                                 type="primary"
                                 onClick={() => verifyRef.current?.scrollIntoView({ behavior: "smooth" })}
                              >
                                 Xác nhận
                              </Button>
                           </div>
                        ),
                     },
                     {
                        title: TaskStatusTagMapper[TaskStatus.COMPLETED].text,
                        description: "Tác vụ đã hoàn thành",
                     },
                  ]}
               />
            </Card>
         </section>
         {(api.data?.status === TaskStatus.HEAD_STAFF_CONFIRM || api.data?.status === TaskStatus.COMPLETED) && (
            <section ref={verifyRef} className="my-layout">
               <Card>
                  <section>
                     <h2 className="mb-2 text-base font-medium">Hình ảnh minh chứng</h2>
                     <div className="flex items-center gap-2">
                        {api.isSuccess && (
                           <Image
                              src={clientEnv.BACKEND_URL + `/file-image/${api.data.imagesVerify?.[0]}`}
                              alt="image"
                              className="h-20 w-20 rounded-lg"
                           />
                        )}
                        <div className="grid h-20 w-20 place-content-center rounded-lg border-2 border-dashed border-neutral-200"></div>
                        <div className="grid h-20 w-20 place-content-center rounded-lg border-2 border-dashed border-neutral-200"></div>
                     </div>
                  </section>
                  <section className="mt-4">
                     <h2 className="mb-2 text-base font-medium">Video minh chứng</h2>
                     {api.isSuccess ? (
                        !!api.data.videosVerify ? (
                           <video width="100%" height="240" controls>
                              <source
                                 src={clientEnv.BACKEND_URL + `/file-video/${api.data.videosVerify}`}
                                 type="video/mp4"
                              />
                           </video>
                        ) : (
                           <div className="grid h-20 w-full place-content-center rounded-lg bg-neutral-100">
                              Không có
                           </div>
                        )
                     ) : null}
                  </section>
                  {api.data?.status === TaskStatus.HEAD_STAFF_CONFIRM && (
                     <section className="mt-4 flex items-center gap-2">
                        <Button type="default" size="large" className="w-full" onClick={() => setTab("issues")}>
                           Xem chi tiết
                        </Button>
                        <Button type="primary" size="large" className="w-full" onClick={handleUpdateConfirmCheck}>
                           Xác nhận
                        </Button>
                     </section>
                  )}
               </Card>
            </section>
         )}
      </section>
   )
}
