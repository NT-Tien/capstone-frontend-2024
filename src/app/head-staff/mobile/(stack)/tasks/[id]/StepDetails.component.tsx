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

export default function StepDetails({ api }: Props) {
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
    <section className="mt-3 px-layout py-3 border-none">
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
         </section>
   )
}