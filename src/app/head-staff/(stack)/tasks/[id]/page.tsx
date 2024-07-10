"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import HeadStaff_Task_OneById from "@/app/head-staff/_api/task/one-byId.api"
import RootHeader from "@/common/components/RootHeader"
import { DeleteOutlined, LeftOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { App, Avatar, Button, Card, Collapse, Descriptions, Empty, List, Tabs, Tag, Typography } from "antd"
import { FixType } from "@/common/enum/fix-type.enum"
import SelectSparePartDrawer from "@/app/head-staff/_components/SelectSparePart.drawer"
import HeadStaff_SparePart_Create from "@/app/head-staff/_api/spare-part/create.api"
import HeadStaff_SparePart_Delete from "@/app/head-staff/_api/spare-part/delete.api"
import AssignFixerDrawer from "@/app/head-staff/(stack)/tasks/[id]/_components/AssignFixer.drawer"
import HeadStaff_Task_UpdateAssignFixer from "@/app/head-staff/_api/task/update-assignFixer.api"
import { TaskStatus } from "@/common/enum/task-status.enum"
import CreateIssueDrawer from "@/app/head-staff/_components/CreateIssue.drawer"
import { useTranslation } from "react-i18next"
import { useIssueRequestStatusTranslation } from "@/common/enum/use-issue-request-status-translation"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import DeviceDetailsCard from "@/common/components/DeviceDetailsCard"
import ModalConfirm from "@/common/components/ModalConfirm"
import { cn } from "@/common/util/cn.util"
import AcceptTaskDrawer from "@/app/head-staff/_components/AcceptTask.drawer"
import React from "react"

export default function TaskDetails({ params }: { params: { id: string } }) {
   const result = useQuery({
      queryKey: qk.task.one_byId(params.id),
      queryFn: () => HeadStaff_Task_OneById({ id: params.id }),
   })
   const request = useQuery({
      queryKey: qk.issueRequests.byId(result.data?.request.id ?? ""),
      queryFn: () => HeadStaff_Request_OneById({ id: result.data?.request.id ?? "" }),
      enabled: result.isSuccess,
   })
   const router = useRouter()
   const { message } = App.useApp()
   const { t } = useTranslation()
   const { getFixTypeTranslation } = useIssueRequestStatusTranslation()

   const mutate_addSparePart = useMutation({
      mutationFn: HeadStaff_SparePart_Create,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "creating-spare-part",
            content: "Adding Spare Part...",
         })
      },
      onError: async () => {
         message.error("Failed to add spare part")
      },
      onSuccess: async () => {
         message.success("Spare part added")
         await request.refetch()
      },
      onSettled: () => {
         message.destroy("creating-spare-part")
      },
   })

   const mutate_deleteSparePart = useMutation({
      mutationFn: HeadStaff_SparePart_Delete,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "remove-spare-part",
            content: "Removing Spare Part...",
         })
      },
      onError: async () => {
         message.error("Failed to remove spare part")
      },
      onSuccess: async () => {
         message.success("Spare part removed")
         await result.refetch()
      },
      onSettled: () => {
         message.destroy("remove-spare-part")
      },
   })

   const mutate_assignFixer = useMutation({
      mutationFn: HeadStaff_Task_UpdateAssignFixer,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "assigning-fixer",
            content: "Assigning Fixer...",
         })
      },
      onError: async () => {
         message.error("Failed to assign fixer")
      },
      onSuccess: async () => {
         message.success("Fixer assigned")
         await result.refetch()
      },
      onSettled: () => {
         message.destroy("assigning-fixer")
      },
   })

   return (
      <div className="std-layout">
         <RootHeader
            title="Task Details"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            className="std-layout-outer p-4"
         />
         <Tabs
            className="main-tabs std-layout-outer"
            type="line"
            items={[
               {
                  key: "details",
                  label: "Details",
                  children: (
                     <>
                        <ProDescriptions
                           className="mt-3"
                           dataSource={result.data}
                           loading={result.isLoading}
                           size="small"
                           columns={[
                              {
                                 key: "name",
                                 label: t("TaskName"),
                                 dataIndex: "name",
                              },
                              {
                                 key: "created",
                                 label: t("Created"),
                                 dataIndex: "createdAt",
                                 render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                              },
                              {
                                 key: "status",
                                 label: t("Status"),
                                 dataIndex: "status",
                                 render: (_, e) => <Tag>{e.status}</Tag>,
                              },
                              {
                                 key: "priority",
                                 label: t("Priority"),
                                 render: (_, e) =>
                                    e.priority ? (
                                       <Tag color="red">{t("High")}</Tag>
                                    ) : (
                                       <Tag color="green">{t("Low")}</Tag>
                                    ),
                              },
                              {
                                 key: "totalTime",
                                 label: t("TotalTime"),
                                 render: (_, e) => e.totalTime + " minutes",
                              },
                              {
                                 key: "operator",
                                 label: t("operator"),
                                 dataIndex: "operator",
                              },
                           ]}
                        />
                        <DeviceDetailsCard device={result.data?.device} className="mt-3" />
                     </>
                  ),
               },
               {
                  key: "issues",
                  label: "Issues",
                  children: (
                     <div>
                        {request.isSuccess && request.data.issues.length !== 0 && (
                           <Collapse
                              expandIconPosition="end"
                              items={request.data?.issues.map((item: FixRequestIssueDto) => ({
                                 key: item.id,
                                 label: (
                                    <div>
                                       <Tag color={item.fixType === FixType.REPAIR ? "red" : "blue"}>
                                          {getFixTypeTranslation(item.fixType)}
                                       </Tag>
                                       <Typography.Text className="w-40">{item.typeError.name}</Typography.Text>
                                    </div>
                                 ),
                                 children: (
                                    <div>
                                       <Card size={"small"}>
                                          <span className="text-gray-500">Description: </span>
                                          {item.description}
                                       </Card>
                                       <div className="mt-2 w-full">
                                          {item.issueSpareParts.length === 0 ? (
                                             <Card className="my-3">
                                                <Empty
                                                   description={
                                                      <span>
                                                         This issue has{" "}
                                                         <strong className="font-bold underline">no spare parts</strong>{" "}
                                                         assigned
                                                      </span>
                                                   }
                                                   className="rounded-lg py-6"
                                                />
                                             </Card>
                                          ) : (
                                             <List
                                                className={"w-full"}
                                                dataSource={item.issueSpareParts}
                                                itemLayout={"horizontal"}
                                                size={"small"}
                                                renderItem={(sp) => (
                                                   <List.Item itemID={sp.id} key={sp.id}>
                                                      <List.Item.Meta
                                                         title={sp.sparePart.name}
                                                         description={`${t("Qty")}: ${sp.quantity}`}
                                                      ></List.Item.Meta>
                                                   </List.Item>
                                                )}
                                             />
                                          )}
                                       </div>
                                    </div>
                                 ),
                              }))}
                           />
                        )}
                     </div>
                  ),
               },
               {
                  key: "fixer",
                  label: "Fixer",
                  children: (
                     <div>
                        {result.isSuccess && result.data.fixer !== null ? (
                           <Card
                              size="small"
                              classNames={{
                                 body: "flex",
                              }}
                           >
                              <Avatar icon={<UserOutlined />} />
                              <div className="ml-3">
                                 <div className="text-base font-semibold">{result.data.fixer.username}</div>
                                 <div className="text-xs">{result.data.fixer.phone}</div>
                              </div>
                           </Card>
                        ) : (
                           <>
                              <Card size="small">
                                 By assigning a fixer, this task will be automatically moved to <Tag>PENDING</Tag>status
                              </Card>
                              <AssignFixerDrawer
                                 onFinish={(fixerId) => {
                                    mutate_assignFixer.mutate({
                                       id: params.id,
                                       payload: {
                                          fixer: fixerId,
                                       },
                                    })
                                    router.push("/head-staff/tasks?status=ASSIGNED")
                                 }}
                              >
                                 {(handleOpen) => (
                                    <Button type="primary" className="mt-3 w-full" onClick={handleOpen} size="large">
                                       Add Fixer
                                    </Button>
                                 )}
                              </AssignFixerDrawer>
                           </>
                        )}
                     </div>
                  ),
               },
            ]}
         />
      </div>
   )
}
