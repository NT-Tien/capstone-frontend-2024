"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Task_OneById from "@/app/head-staff/_api/task/one-byId.api"
import { PageContainer } from "@ant-design/pro-layout"
import { App, Button, Card, Tag } from "antd"
import { useRouter } from "next/navigation"
import { ProDescriptions } from "@ant-design/pro-components"
import { PriorityTagMapper, TaskDto } from "@/common/dto/Task.dto"
import dayjs from "dayjs"
import { LeftOutlined } from "@ant-design/icons"
import { TaskStatusTagMapper } from "@/common/enum/task-status.enum"

export default function TaskDetails({ params }: { params: { id: string } }) {
   const { message } = App.useApp()
   const router = useRouter()
   const queryClient = useQueryClient()

   const api = useQuery({
      queryKey: headstaff_qk.task.byId(params.id),
      queryFn: () => HeadStaff_Task_OneById({ id: params.id }),
   })

   return (
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
               <Tag key="priority" color={PriorityTagMapper[String(api.data?.priority)].color}>
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
         }}
         tabList={[
            {
               key: "tab-issues",
               tab: "Issues",
               children: <div>Hi</div>,
            },
         ]}
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
                        title: "Priority",
                        dataIndex: ["priority"],
                        render: (_, e) => (
                           <Tag color={PriorityTagMapper[String(e.priority)].color}>
                              {PriorityTagMapper[String(e.priority)].textLong}
                           </Tag>
                        ),
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
                  ]}
               />
               <Card size="default">
                  <ProDescriptions
                     title={"Device"}
                     bordered
                     size="middle"
                     dataSource={api.data?.device}
                     loading={api.isPending}
                     columns={[
                        {
                           title: "Machine Model",
                           dataIndex: ["machineModel", "name"],
                        },
                        {
                           title: "Manufacturer",
                           dataIndex: ["machineModel", "manufacturer"],
                        },
                        {
                           title: "Position",
                           dataIndex: ["area", "positionX", "positionY"],
                           render: (_, e) => `${e.area.name} (${e.positionX}x${e.positionY})`,
                        },
                        {
                           title: "Operation Status",
                           dataIndex: "operationStatus",
                        },
                        {
                           title: "Description",
                           dataIndex: "description",
                           span: 3,
                        },
                        {
                           title: "Year of Production",
                           dataIndex: ["machineModel", "yearOfProduction"],
                        },
                        {
                           title: "Date of Receipt",
                           dataIndex: ["machineModel", "dateOfReceipt"],
                        },
                        {
                           title: "Warranty Term",
                           dataIndex: ["machineModel", "warrantyTerm"],
                        },
                     ]}
                  />
               </Card>
            </>
         }
      ></PageContainer>
   )
}
