"use client"

import RootHeader from "@/common/components/RootHeader"
import { useMutation, useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { ProDescriptions } from "@ant-design/pro-components"
import { CloseOutlined, DeleteOutlined, LeftOutlined, PlusOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { App, Button, Card, Collapse, Empty, List, Tabs, Tag, Typography } from "antd"
import {
   FixRequestStatus,
   FixRequestStatusTagMapper,
   IssueRequestStatusTag,
} from "@/common/enum/issue-request-status.enum"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import RejectTaskDrawer from "@/app/head-staff/_components/RejectTask.drawer"
import { useTranslation } from "react-i18next"
import React, { ReactNode, useCallback, useState } from "react"
import { NotePencil } from "@phosphor-icons/react"
import DeviceDetailsCard from "@/common/components/DeviceDetailsCard"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { FixType } from "@/common/enum/fix-type.enum"
import SelectSparePartDrawer from "@/app/head-staff/_components/SelectSparePart.drawer"
import CreateIssueDrawer from "@/app/head-staff/_components/CreateIssue.drawer"
import { useIssueRequestStatusTranslation } from "@/common/enum/use-issue-request-status-translation"
import HeadStaff_SparePart_Create from "@/app/head-staff/_api/spare-part/create.api"
import HeadStaff_SparePart_Delete from "@/app/head-staff/_api/spare-part/delete.api"
import HeadStaff_Issue_Delete from "@/app/head-staff/_api/issue/delete.api"
import ModalConfirm from "@/common/components/ModalConfirm"
import { cn } from "@/common/util/cn.util"
import AcceptTaskDrawer from "@/app/head-staff/_components/AcceptTask.drawer"

export default function RequestDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { t } = useTranslation()
   const [tab, setTab] = useState<string>("main-tab-request")
   const { getFixTypeTranslation } = useIssueRequestStatusTranslation()
   const { message } = App.useApp()

   const request = useQuery({
      queryKey: qk.issueRequests.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
   })

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

   const mutate_deleteIssue = useMutation({
      mutationFn: HeadStaff_Issue_Delete,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "remove",
            content: "Removing Issue...",
         })
      },
      onError: async () => {
         message.error("Failed to remove issue")
      },
      onSuccess: async () => {
         message.success("Issue removed")
         await request.refetch()
      },
      onSettled: () => {
         message.destroy("remove")
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
         await request.refetch()
      },
      onSettled: () => {
         message.destroy("remove-spare-part")
      },
   })

   const ShowAction = useCallback(
      ({ children }: { children: ReactNode }) => {
         if (request.data?.status === FixRequestStatus.PENDING) {
            return children
         }
         return null
      },
      [request.data],
   )

   return (
      <div className="std-layout">
         <RootHeader
            title="Request Details"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            className="std-layout-outer p-4"
         />
         <section className="std-layout-outer">
            <Tabs
               className="main-tabs"
               type="line"
               activeKey={tab}
               onChange={(key) => setTab(key)}
               items={[
                  {
                     key: "main-tab-request",
                     label: "Request",
                     children: (
                        <>
                           <section className="mt-layout-half flex gap-2">
                              <ProDescriptions
                                 loading={request.isLoading}
                                 dataSource={request.data}
                                 size="small"
                                 className="flex-grow"
                                 columns={[
                                    {
                                       key: "createdAt",
                                       title: t("Created"),
                                       dataIndex: "createdAt",
                                       render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                                    },
                                    {
                                       key: "updatedAt",
                                       title: t("LastUpdated"),
                                       dataIndex: "updatedAt",
                                       render: (_, e) =>
                                          e.updatedAt === e.createdAt
                                             ? "-"
                                             : dayjs(e.updatedAt).format("DD/MM/YYYY - HH:mm"),
                                    },
                                    {
                                       key: "account-name",
                                       title: t("ReportedBy"),
                                       render: (_, e) => e.requester?.username ?? "-",
                                    },
                                 ]}
                              />
                              <div className="pb-1.5">
                                 <Tag
                                    color={FixRequestStatusTagMapper[String(request.data?.status)].colorInverse}
                                    className="mr-0 grid h-full place-items-center px-3"
                                 >
                                    {FixRequestStatusTagMapper[String(request.data?.status)].text}
                                 </Tag>
                              </div>
                           </section>
                           <section>
                              <Card
                                 className="mt-layout-half"
                                 title={
                                    <div className="flex items-center gap-2">
                                       <NotePencil size={16} /> {t("RequesterNote")}
                                    </div>
                                 }
                                 size="small"
                              >
                                 {request.data?.requester_note}
                              </Card>
                           </section>
                           <section className="std-layout-grow mt-layout-half">
                              <DeviceDetailsCard device={request.data?.device} />
                           </section>
                           {request.data?.status === FixRequestStatus.REJECTED && (
                              <section className="mt-layout-half">
                                 <Card
                                    className="mt-layout-half"
                                    title={
                                       <div className="flex items-center gap-2">
                                          <NotePencil size={16} /> Rejection Reason
                                       </div>
                                    }
                                    size="small"
                                 >
                                    {request.data?.checker_note}
                                 </Card>
                              </section>
                           )}
                           <section className="py-layout">
                              <ShowAction>
                                 <Typography.Title level={5}>Actions</Typography.Title>
                                 <div className="flex flex-col gap-2">
                                    <RejectTaskDrawer>
                                       {(handleOpen) => (
                                          <Button
                                             danger={true}
                                             type="primary"
                                             size="large"
                                             className="w-full"
                                             onClick={() => handleOpen(params.id)}
                                             icon={<CloseOutlined />}
                                          >
                                             Reject Request
                                          </Button>
                                       )}
                                    </RejectTaskDrawer>

                                    <Button
                                       type="default"
                                       size="large"
                                       className="w-full"
                                       onClick={() => setTab("main-tab-issues")}
                                       icon={<PlusOutlined />}
                                    >
                                       Add Issues
                                    </Button>
                                 </div>
                              </ShowAction>
                              {request.data?.status === FixRequestStatus.APPROVED && (
                                 <Button
                                    size="large"
                                    className="fixed bottom-0 left-0 m-4 w-[calc(100%-32px)]"
                                    type="primary"
                                 >
                                    Goto Task
                                 </Button>
                              )}
                           </section>
                        </>
                     ),
                  },
                  {
                     key: "main-tab-issues",
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
                                          <Card size={"small"} className="mb-2">
                                             <span className="text-gray-500">Description: </span>
                                             {item.description}
                                          </Card>
                                          <SelectSparePartDrawer
                                             onFinish={(values) => {
                                                mutate_addSparePart.mutate({
                                                   issue: item.id,
                                                   sparePart: values.sparePartId,
                                                   quantity: values.quantity,
                                                })
                                             }}
                                          >
                                             {(handleOpen) => (
                                                <div className="w-full">
                                                   {item.issueSpareParts.length === 0 ? (
                                                      <Card className="my-3">
                                                         <Empty
                                                            description={
                                                               <span>
                                                                  This issue has{" "}
                                                                  <strong className="font-bold underline">
                                                                     no spare parts
                                                                  </strong>{" "}
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
                                                            <List.Item
                                                               itemID={sp.id}
                                                               key={sp.id}
                                                               extra={
                                                                  <ShowAction>
                                                                     <Button
                                                                        danger
                                                                        type="text"
                                                                        size={"small"}
                                                                        icon={<DeleteOutlined />}
                                                                        onClick={() => {
                                                                           mutate_deleteSparePart.mutate({
                                                                              id: sp.id,
                                                                           })
                                                                        }}
                                                                     />
                                                                  </ShowAction>
                                                               }
                                                            >
                                                               <List.Item.Meta
                                                                  title={sp.sparePart.name}
                                                                  description={`${t("Qty")}: ${sp.quantity}`}
                                                               ></List.Item.Meta>
                                                            </List.Item>
                                                         )}
                                                      />
                                                   )}
                                                   <ShowAction>
                                                      <div className="mt-3 flex gap-3">
                                                         <Button
                                                            className="w-full flex-grow"
                                                            type="dashed"
                                                            onClick={() =>
                                                               request.isSuccess &&
                                                               handleOpen(
                                                                  request.data.device.id,
                                                                  item.issueSpareParts.map((sp) => sp.sparePart.id),
                                                               )
                                                            }
                                                            icon={<PlusOutlined />}
                                                         >
                                                            Add Spare Part
                                                         </Button>
                                                         <ModalConfirm
                                                            onConfirm={() => {
                                                               mutate_deleteIssue.mutate({
                                                                  id: item.id,
                                                               })
                                                            }}
                                                            confirmText="Delete"
                                                            confirmProps={{
                                                               danger: true,
                                                               disabled: item.issueSpareParts.length > 0,
                                                            }}
                                                            title={
                                                               <div className="flex items-center gap-2">
                                                                  <DeleteOutlined />
                                                                  Delete Issue
                                                               </div>
                                                            }
                                                            description={
                                                               item.issueSpareParts.length > 0 ? (
                                                                  <span>
                                                                     Please{" "}
                                                                     <strong className="font-bold">
                                                                        remove all spare parts
                                                                     </strong>{" "}
                                                                     before deleting this issue.
                                                                  </span>
                                                               ) : (
                                                                  "Are you sure you want to delete this issue?"
                                                               )
                                                            }
                                                            modalProps={{
                                                               centered: true,
                                                            }}
                                                         >
                                                            <Button
                                                               type="primary"
                                                               danger={true}
                                                               icon={<DeleteOutlined />}
                                                            >
                                                               Delete Issue
                                                            </Button>
                                                         </ModalConfirm>
                                                      </div>
                                                   </ShowAction>
                                                </div>
                                             )}
                                          </SelectSparePartDrawer>
                                       </div>
                                    ),
                                 }))}
                              />
                           )}
                           {request.isSuccess && (
                              <ShowAction>
                                 <CreateIssueDrawer
                                    onSuccess={async () => {
                                       await request.refetch()
                                    }}
                                 >
                                    {(handleOpen) => (
                                       <Button
                                          type="default"
                                          size="large"
                                          className={cn("w-full", request.data?.issues.length !== 0 && "my-4")}
                                          onClick={() => handleOpen(params.id)}
                                          icon={<PlusOutlined />}
                                       >
                                          Add Issue
                                       </Button>
                                    )}
                                 </CreateIssueDrawer>
                              </ShowAction>
                           )}
                           <ShowAction>
                              <div className="fixed bottom-0 left-0 w-full bg-white p-layout">
                                 <AcceptTaskDrawer
                                    onSuccess={(task) => {
                                       router.push(`/head-staff/tasks/${task.id}`)
                                    }}
                                 >
                                    {(handleOpen) => (
                                       <Button
                                          size="large"
                                          type="primary"
                                          className="w-full"
                                          disabled={request.data?.issues.length === 0}
                                          onClick={() => handleOpen(params.id)}
                                       >
                                          Create Task & Approve Request
                                       </Button>
                                    )}
                                 </AcceptTaskDrawer>
                              </div>
                           </ShowAction>
                        </div>
                     ),
                  },
                  ...(request.data?.status === FixRequestStatus.APPROVED
                     ? [
                          {
                             key: "main-tab-tasks",
                             label: "Tasks",
                             children: <div></div>,
                          },
                       ]
                     : []),
               ]}
            />
         </section>
      </div>
   )
}
