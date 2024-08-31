"use client"

import HeadStaff_Task_UpdateComplete from "@/app/head-staff/_api/task/update-complete.api"
import { TaskDto } from "@/common/dto/Task.dto"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import { clientEnv } from "@/env"
import { LinkOutlined, UserOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { useMutation, UseQueryResult } from "@tanstack/react-query"
import { App, Avatar, Button, Card, Image, Progress, Steps, Tag } from "antd"
import dayjs from "dayjs"
import Link from "next/link"
import { useRef } from "react"
import AssignFixerDrawer, { AssignFixerDrawerRefType } from "./AssignFixer.drawer"

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
   const assignFixerRef = useRef<AssignFixerDrawerRefType | null>(null)

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
            className="mt-3 flex-grow items-start items-center justify-between gap-2 px-layout py-3 text-base font-semibold"
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
                  key: "status",
                  label: "Trạng thái",
                  render: (_, e) => (
                     <Tag color={TaskStatusTagMapper[String(e.status)]?.colorInverse ?? "default"}>
                        {TaskStatusTagMapper[String(e.status)].text ?? "-"}
                     </Tag>
                  ),
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
                  key: "fix date",
                  label: "Ngày sửa",
                  dataIndex: "fixerDate",
                  render: (_, e) => (e.fixerDate ? dayjs(e.fixerDate).add(7, "hours").format("DD/MM/YYYY") : "-"),
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
               ...(api.isSuccess &&
               new Set([TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.CANCELLED]).has(
                  api.data.status,
               )
                  ? [
                       {
                          key: "finished",
                          title: "Hoàn thành",
                          render: (_: any, e: TaskDto) => {
                             return (
                                <Progress
                                   percent={Math.floor(
                                      (e.issues.reduce(
                                         (acc, prev) => acc + (prev.status === IssueStatusEnum.RESOLVED ? 1 : 0),
                                         0,
                                      ) *
                                         100) /
                                         e.issues.length,
                                   )}
                                />
                             )
                          },
                       },
                    ]
                  : []),
            ]}
         />
         {api.isSuccess && api.data.fixer && (
            <Card
               size="small"
               className="mt-3"
               classNames={{
                  body: "flex",
               }}
            >
               <Avatar icon={<UserOutlined />} />
               <div className="ml-3">
                  <div className="text-base font-semibold">{api.data.fixer?.username}</div>
                  <div className="text-xs">{api.data.fixer?.phone}</div>
               </div>
            </Card>
         )}
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
         <AssignFixerDrawer ref={assignFixerRef} refetchFn={api.refetch} />
      </section>
   )
}
