"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Task_OneById from "@/app/head-staff/_api/task/one-byId.api"
import { PageContainer } from "@ant-design/pro-layout"
import { App, Avatar, Button, Card, Dropdown, Space, Steps, Tag } from "antd"
import { useRouter } from "next/navigation"
import { ProDescriptions } from "@ant-design/pro-components"
import { PriorityTagMapper, TaskDto } from "@/common/dto/Task.dto"
import dayjs from "dayjs"
import { LeftOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import IssuesTab from "@/app/head-staff/desktop/tasks/[id]/IssuesTab"
import { useMemo } from "react"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"
import AssignFixerModal from "@/app/head-staff/_components/AssignFixer.modal"

function getTaskStatus(status?: TaskStatus) {
   switch (status) {
      case TaskStatus.AWAITING_FIXER:
         return 0
      case TaskStatus.ASSIGNED:
         return 1
      case TaskStatus.CANCELLED:
      case TaskStatus.IN_PROGRESS:
         return 2
      case TaskStatus.COMPLETED:
         return 3
      default:
         return 0
   }
}

export default function TaskDetails({ params }: { params: { id: string } }) {
   const router = useRouter()

   const api = useQuery({
      queryKey: headstaff_qk.task.byId(params.id),
      queryFn: () => HeadStaff_Task_OneById({ id: params.id }),
   })

   const percentFinished = useMemo(() => {
      if (!api.isSuccess) return
      const total = api.data.issues.length
      const done = api.data.issues.filter((e) => e.status === IssueStatusEnum.RESOLVED).length
      return (done / total) * 100
   }, [api.data, api.isSuccess])

   return (
      <AssignFixerModal>
         {(handleOpen) => (
            <PageContainer
               header={{
                  title: (
                     <div className="flex items-center gap-3">
                        <Button icon={<LeftOutlined />} onClick={router.back} />
                        <span>Chi tiết tác vụ</span>
                     </div>
                  ),
                  tags: [
                     <Tag key="status" color={TaskStatusTagMapper[String(api.data?.status)].colorInverse}>
                        {TaskStatusTagMapper[String(api.data?.status)].text}
                     </Tag>,
                     <Tag key="priority" color={PriorityTagMapper[String(api.data?.priority)].colorInverse}>
                        {PriorityTagMapper[String(api.data?.priority)].textLong}
                     </Tag>,
                  ],
                  breadcrumb: {
                     items: [
                        {
                           title: "Trang chủ",
                           onClick: () => router.push("/head-staff/desktop/dashboard"),
                        },
                        {
                           title: "Tác vụ",
                           onClick: () => router.push("/head-staff/desktop/tasks"),
                        },
                        {
                           title: "Chi tiết",
                        },
                     ],
                  },
                  extra: (
                     <Space>
                        {api.data?.status === TaskStatus.AWAITING_FIXER && (
                           <Button
                              type="primary"
                              onClick={() => handleOpen(params.id, api.data?.fixerDate, api.data?.priority)}
                           >
                              Phân công thợ sửa
                           </Button>
                        )}
                        <Dropdown
                           placement="bottomRight"
                           menu={{
                              items: [
                                 {
                                    label: "Xuất dữ liệu",
                                    key: "export",
                                 },
                              ],
                           }}
                        >
                           <Button type="primary" icon={<MoreOutlined />} />
                        </Dropdown>
                     </Space>
                  ),
               }}
               content={
                  <>
                     <ProDescriptions<TaskDto>
                        dataSource={api.data}
                        loading={api.isPending}
                        columns={[
                           {
                              title: "Tên",
                              dataIndex: ["name"],
                           },
                           {
                              title: "Ngày tạo",
                              dataIndex: ["createdAt"],
                              render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("DD-MM-YYYY HH:mm"),
                           },
                           {
                              title: "Ngày cập nhật",
                              dataIndex: ["updatedAt"],
                              render: (_, e) => dayjs(e.updatedAt).add(7, "hours").format("DD-MM-YYYY HH:mm"),
                           },
                           {
                              title: "Thông số kỹ thuật",
                              dataIndex: ["operator"],
                           },
                           {
                              title: "Ngày sửa",
                              dataIndex: ["fixerDate"],
                              render: (_, e) => dayjs(e.fixerDate).add(7, "hours").format("DD-MM-YYYY"),
                           },
                           {
                              title: "Tổng thời gian",
                              dataIndex: ["totalTime"],
                           },
                           {
                              title: "Thợ sửa",
                              dataIndex: ["fixer", "username"],
                              render: (_, e) => e.fixer?.username,
                              className: api.data?.status === TaskStatus.AWAITING_FIXER ? "hidden" : "",
                           },
                        ]}
                     />
                     {api.isSuccess && (
                        <Card className="mb-4">
                           <Steps
                              current={getTaskStatus(api.data?.status)}
                              status={api.data.status === TaskStatus.CANCELLED ? "error" : "process"}
                              percent={api.data.status === TaskStatus.IN_PROGRESS ? percentFinished : undefined}
                              labelPlacement="vertical"
                              items={[
                                 {
                                    title: "Unassigned",
                                    description: (
                                       <Button
                                          type="link"
                                          size={"middle"}
                                          disabled={api.data.status !== TaskStatus.AWAITING_FIXER}
                                          onClick={() => handleOpen(params.id, api.data?.fixerDate, api.data?.priority)}
                                       >
                                          Phân công người sửa chữa
                                       </Button>
                                    ),
                                 },
                                 {
                                    title: "Đang chờ",
                                    description: "Tác vụ đang chờ",
                                 },
                                 {
                                    title: "Đang thực hiện",
                                    description: "Tác vụ đang tiến hành",
                                 },
                                 {
                                    title: "Hoàn thành",
                                    description: "Tác vụ hoàn tất",
                                 },
                              ]}
                           />
                        </Card>
                     )}
                     <Card
                        size="default"
                        classNames={{
                           body: "px-6 pt-4 pb-6",
                        }}
                     >
                        <ProDescriptions
                           className="descriptions-header-margin"
                           title={"Chi tiết thiết bị"}
                           bordered
                           size="middle"
                           dataSource={api.data?.device}
                           loading={api.isPending}
                           labelStyle={{
                              color: "black",
                              fontWeight: 500,
                           }}
                           column={3}
                           columns={[
                              {
                                 label: "Mẫu máy",
                                 dataIndex: ["machineModel", "name"],
                              },
                              {
                                 label: "Nhà sản xuất",
                                 dataIndex: ["machineModel", "manufacturer"],
                              },
                              {
                                 label: "Trạng thái thông số kỹ thuật",
                                 dataIndex: "operationStatus",
                              },
                              {
                                 label: "Khu vực",
                                 dataIndex: ["area", "name"],
                                 span: 2,
                              },
                              {
                                 label: "Vị trí",
                                 dataIndex: ["positionX", "positionY"],
                                 render: (_, e) => `${e.positionX}x${e.positionY}`,
                                 span: 1,
                              },
                              {
                                 label: "Năm sản xuất",
                                 dataIndex: ["machineModel", "yearOfProduction"],
                              },
                              {
                                 label: "Ngày nhận",
                                 dataIndex: ["machineModel", "dateOfReceipt"],
                              },
                              {
                                 label: "Thời hạn bảo hành",
                                 dataIndex: ["machineModel", "warrantyTerm"],
                              },
                              {
                                 label: "Mô tả",
                                 dataIndex: "description",
                                 span: 3,
                              },
                           ]}
                        />
                     </Card>
                  </>
               }
            >
               <IssuesTab
                  issues={api.data?.issues}
                  device={api.data?.device}
                  isLoading={api.isPending}
                  refetch={api.refetch}
               />
            </PageContainer>
         )}
      </AssignFixerModal>
   )
}
