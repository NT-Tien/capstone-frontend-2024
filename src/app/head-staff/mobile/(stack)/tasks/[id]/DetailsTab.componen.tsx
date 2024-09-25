"use client"

import HeadStaff_Task_UpdateComplete from "@/features/head-maintenance/api/task/update-complete.api"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
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
            className="mt-3"
            title="Chi tiết tác vụ"
            extra={
               api.isSuccess && (
                  <Tag color={TaskStatusTagMapper[String(api.data.status)]?.colorInverse ?? "default"}>
                     {TaskStatusTagMapper[String(api.data.status)].text ?? "-"}
                  </Tag>
               )
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
         <section className="mt-3">
            <Card>
               <Steps
                  current={TaskStatusNumberMapper(api.data) ?? 0}
                  direction="vertical"
                  items={[
                     {
                        title: TaskStatusTagMapper[TaskStatus.AWAITING_FIXER].text,
                        description: (
                           <div>
                              <span>Chờ phân công nhân viên</span>
                              <div className="mt-2">
                                 {api.data?.status === TaskStatus.AWAITING_FIXER && (
                                    <Button
                                       type="primary"
                                       className="w-full"
                                       size="middle"
                                       onClick={() =>
                                          api.isSuccess &&
                                          assignFixerRef.current?.handleOpen(api.data.id, {
                                             fixer: api.data.fixer,
                                             fixerDate: dayjs(api.data.fixerDate).add(7, "hours"),
                                             priority: api.data.priority,
                                          })
                                       }
                                    >
                                       Phân công tác vụ
                                    </Button>
                                 )}
                              </div>
                           </div>
                        ),
                     },
                     {
                        title: TaskStatusTagMapper[TaskStatus.ASSIGNED].text,
                        description: (
                           <div>
                              <span>Đã phân công nhân viên, chờ nhân viên bắt đầu</span>
                              <div className="mt-2">
                                 {api.data?.status === TaskStatus.ASSIGNED && (
                                    <Button
                                       type="default"
                                       className="w-full"
                                       size="middle"
                                       onClick={() =>
                                          api.isSuccess &&
                                          assignFixerRef.current?.handleOpen(api.data.id, {
                                             fixer: api.data.fixer,
                                             fixerDate: dayjs(api.data.fixerDate).add(7, "hours"),
                                             priority: api.data.priority,
                                          })
                                       }
                                    >
                                       Cập nhật thông tin
                                    </Button>
                                 )}
                              </div>
                           </div>
                        ),
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
                           <div className="flex flex-col gap-2">
                              <span>Chờ xác nhận từ trưởng phòng</span>
                              {api.data?.status === TaskStatus.HEAD_STAFF_CONFIRM && (
                                 <Button
                                    size="middle"
                                    type="default"
                                    onClick={() => verifyRef.current?.scrollIntoView({ behavior: "smooth" })}
                                 >
                                    Xác nhận
                                 </Button>
                              )}
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
         <AssignFixerDrawer ref={assignFixerRef} refetchFn={api.refetch} />
      </section>
   )
}
