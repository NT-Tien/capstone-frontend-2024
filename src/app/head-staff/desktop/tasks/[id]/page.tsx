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
                        <span>Task Details</span>
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
                           title: "Dashboard",
                           onClick: () => router.push("/head-staff/desktop/dashboard"),
                        },
                        {
                           title: "Tasks",
                           onClick: () => router.push("/head-staff/desktop/tasks"),
                        },
                        {
                           title: "Details",
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
                              Assign Fixer
                           </Button>
                        )}
                        <Dropdown
                           placement="bottomRight"
                           menu={{
                              items: [
                                 {
                                    label: "Export",
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
                              title: "Name",
                              dataIndex: ["name"],
                           },
                           {
                              title: "Created At",
                              dataIndex: ["createdAt"],
                              render: (_, e) => dayjs(e.createdAt).format("DD-MM-YYYY HH:mm"),
                           },
                           {
                              title: "Updated At",
                              dataIndex: ["updatedAt"],
                              render: (_, e) => dayjs(e.updatedAt).format("DD-MM-YYYY HH:mm"),
                           },
                           {
                              title: "Operator",
                              dataIndex: ["operator"],
                           },
                           {
                              title: "Fix Date",
                              dataIndex: ["fixerDate"],
                              render: (_, e) => dayjs(e.fixerDate).format("DD-MM-YYYY"),
                           },
                           {
                              title: "Total Time",
                              dataIndex: ["totalTime"],
                           },
                           {
                              title: "Fixer",
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
                                          Assign a fixer
                                       </Button>
                                    ),
                                 },
                                 {
                                    title: "Pending",
                                    description: "Task is pending",
                                 },
                                 {
                                    title: "In Progress",
                                    description: "Task is in progress",
                                 },
                                 {
                                    title: "Done",
                                    description: "Task finished",
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
                           title={"Device"}
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
                                 label: "Machine Model",
                                 dataIndex: ["machineModel", "name"],
                              },
                              {
                                 label: "Manufacturer",
                                 dataIndex: ["machineModel", "manufacturer"],
                              },
                              {
                                 label: "Operation Status",
                                 dataIndex: "operationStatus",
                              },
                              {
                                 label: "Area",
                                 dataIndex: ["area", "name"],
                                 span: 2,
                              },
                              {
                                 label: "Position",
                                 dataIndex: ["positionX", "positionY"],
                                 render: (_, e) => `${e.positionX}x${e.positionY}`,
                                 span: 1,
                              },
                              {
                                 label: "Year of Production",
                                 dataIndex: ["machineModel", "yearOfProduction"],
                              },
                              {
                                 label: "Date of Receipt",
                                 dataIndex: ["machineModel", "dateOfReceipt"],
                              },
                              {
                                 label: "Warranty Term",
                                 dataIndex: ["machineModel", "warrantyTerm"],
                              },
                              {
                                 label: "Description",
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
