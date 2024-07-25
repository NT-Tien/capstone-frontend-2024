"use client"

import VerifyTaskModal from "@/app/head-staff/mobile/(stack)/tasks/[id]/VerifyTask.modal"
import DataListView from "@/common/components/DataListView"
import { TaskDto } from "@/common/dto/Task.dto"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import { UserOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { MapPin } from "@phosphor-icons/react"
import { UseQueryResult } from "@tanstack/react-query"
import { Avatar, Button, Card, Steps, Tag } from "antd"
import dayjs from "dayjs"

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
      case TaskStatus.COMPLETED: // TODO switcharoo
         return 4
      case TaskStatus.HEAD_STAFF_CONFIRM:
         return 5
      default:
         return 0
   }
}

export default function DetailsTab({ api }: Props) {
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
                              <VerifyTaskModal>
                                 {(handleOpen) => (
                                    <Button
                                       size="small"
                                       type="primary"
                                       onClick={() => api.isSuccess && handleOpen(api.data)}
                                    >
                                       Xác nhận
                                    </Button>
                                 )}
                              </VerifyTaskModal>
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
      </section>
   )
}
