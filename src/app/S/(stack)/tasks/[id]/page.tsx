"use client"

import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import { useRouter } from "next/navigation"
import staff_uri from "@/features/staff/uri"
import { Avatar, Button, Card, ConfigProvider, Descriptions, Divider, Empty, List, Space, Tabs } from "antd"
import staff_queries from "@/features/staff/queries"
import { Calendar, ChartDonut, Clock, Export, Gear, User, Wrench } from "@phosphor-icons/react"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import dayjs from "dayjs"
import { useMemo, useRef, useState } from "react"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { CheckOutlined, CloseOutlined, ExclamationOutlined, MinusOutlined, RightOutlined } from "@ant-design/icons"
import IssueViewDetailsDrawer, {
   IssueViewDetailsDrawerProps,
} from "@/features/staff/components/overlays/IssueViewDetails.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import FinishTaskDrawer, { FinishTaskDrawerProps } from "@/features/staff/components/overlays/FinishTask.drawer"
import ReturnSparePartDrawer, {
   ReturnSparePartDrawerProps,
} from "@/features/staff/components/overlays/ReturnSparePart.drawer"
import TaskUtil from "@/lib/domain/Task/Task.util"

function Page({ params }: { params: { id: string } }) {
   const router = useRouter()
   const [tab, setTab] = useState<"issues" | "spare-parts">("issues")

   const control_issueViewDetailsDrawer = useRef<RefType<IssueViewDetailsDrawerProps>>(null)
   const control_finishTaskDrawer = useRef<RefType<FinishTaskDrawerProps>>(null)
   const control_returnSparePartDrawer = useRef<RefType<ReturnSparePartDrawerProps>>(null)

   const api_task = staff_queries.task.one({ id: params.id })

   const issueSpareParts = useMemo(() => {
      return api_task.data?.issues?.flatMap((issue) => issue.issueSpareParts) || []
   }, [api_task.data?.issues])

   const allIssuesResolved = useMemo(() => {
      return api_task.data?.issues.every((i) => i.status === IssueStatusEnum.RESOLVED)
   }, [api_task.data?.issues])

   const hasDoneAllIssues = useMemo(() => {
      if (!api_task.isSuccess) return false
      return api_task.data.issues.every((i) => i.status !== IssueStatusEnum.PENDING)
   }, [api_task.isLoading, api_task.data?.issues])

   const hasFailedIssueWithSparePart = useMemo(() => {
      if (api_task.isLoading || !api_task.data) return false
      return api_task.data.issues.some((i) => i.status === IssueStatusEnum.FAILED && i.issueSpareParts.length > 0)
   }, [api_task.isLoading, api_task.data?.issues])

   const hasReturnedSpareParts = useMemo(() => {
      if (api_task.isLoading || !api_task.data) return false
      return TaskUtil.hasReturnedSpareParts(api_task.data)
   }, [api_task.isLoading, api_task.data])

   const hasFailedIssueWithoutSparePart = useMemo(() => {
      if (api_task.isLoading || !api_task.data) return false
      return api_task.data.issues.some((i) => i.status === IssueStatusEnum.FAILED && issueSpareParts.length === 0)
   }, [api_task.isLoading, api_task.data?.issues])

   if (!api_task.isSuccess) {
      return <div>Loading...</div>
   }

   console.log("issueSpareParts length:", issueSpareParts.length)

   return (
      <ConfigProvider
         theme={{
            token: {
               colorPrimary: "#FF6B00",
            },
         }}
      >
         <div className={"relative min-h-screen pb-32"}>
            <div className={"absolute left-0 top-0 h-36 w-full bg-staff"} />
            <PageHeaderV2
               prevButton={<PageHeaderV2.BackButton onClick={() => router.push(staff_uri.navbar.tasks)} />}
               title={"Thông tin tác vụ"}
               nextButton={<PageHeaderV2.InfoButton />}
            />
            <section className={"px-layout"}>
               {api_task.isSuccess && (
                  <>
                     <Card size={"small"}>
                        <Descriptions
                           contentStyle={{
                              display: "flex",
                              justifyContent: "flex-end",
                           }}
                           colon={false}
                           items={[
                              {
                                 label: (
                                    <div className={"flex items-center gap-1"}>
                                       <ChartDonut size={18} weight={"fill"} />
                                       <span>Trạng thái</span>
                                    </div>
                                 ),
                                 children:
                                    api_task.data.status === TaskStatus.ASSIGNED ? (
                                       <div
                                          className={cn(
                                             TaskStatusTagMapper[api_task.data.status].className,
                                             "flex items-center gap-1",
                                          )}
                                       >
                                          {TaskStatusTagMapper[api_task.data.status].icon}
                                          Chưa thực hiện
                                       </div>
                                    ) : (
                                       <div
                                          className={cn(
                                             TaskStatusTagMapper[api_task.data.status].className,
                                             "flex items-center gap-1",
                                          )}
                                       >
                                          {TaskStatusTagMapper[api_task.data.status].icon}
                                          {TaskStatusTagMapper[api_task.data.status].text}
                                       </div>
                                    ),
                              },
                              {
                                 label: (
                                    <div className={"flex items-center gap-1"}>
                                       <Calendar size={18} weight={"fill"} />
                                       <span>Ngày sửa</span>
                                    </div>
                                 ),
                                 children: dayjs(api_task.data.fixerDate).format("DD/MM/YYYY"),
                              },
                              {
                                 label: (
                                    <div className={"flex items-center gap-1"}>
                                       <Clock size={18} weight={"fill"} />
                                       <span>Thời gian dự tính</span>
                                    </div>
                                 ),
                                 children: `${api_task.data.totalTime} phút`,
                              },
                              {
                                 label: (
                                    <div className={"flex items-center gap-2"}>
                                       <User size={18} weight={"fill"} />
                                       <span>Người sửa</span>
                                    </div>
                                 ),
                                 children: (
                                    <div className={"flex items-center gap-2"}>
                                       <Avatar className={"bg-yellow-500 text-sm"} size={24}>
                                          {api_task.data.fixer.username.slice(0, 1)}
                                       </Avatar>
                                       <span>{api_task.data.fixer.username}</span>
                                    </div>
                                 ),
                              },
                           ]}
                        />
                     </Card>
                     <Card size={"small"} className="mt-3 w-full bg-[#FF6B00] text-white">
                        <div className={"flex items-center gap-2"}>
                           <div className={"flex-grow"}>
                              <Space className={"text-xs"} split={<Divider type={"vertical"} className={"m-0"} />}>
                                 {api_task.data.device.machineModel.manufacturer}
                                 <span>
                                    Khu vực {api_task?.data?.device?.area?.name} ({api_task?.data?.device?.positionX},{" "}
                                    {api_task?.data?.device?.positionY})
                                 </span>
                              </Space>
                              <h3 className={"line-clamp-2 text-base font-semibold"}>
                                 {api_task.data.device.machineModel.name}
                              </h3>
                              {/*<div className={"text-sm"}>{api_task.data.device.description}</div>*/}
                           </div>
                           <div>
                              <Gear size={32} weight={"fill"} />
                           </div>
                        </div>
                     </Card>
                  </>
               )}
            </section>

            <section className={"px-layout"}>
               {api_task.isSuccess && (
                  <Tabs
                     className={"test-tabs mt-3"}
                     activeKey={tab}
                     onChange={(key) => setTab(key as any)}
                     animated={{
                        inkBar: true,
                        tabPane: true,
                     }}
                     items={[
                        {
                           label: "Lỗi cần sửa",
                           key: "issues",
                           children: (
                              <div>
                                 <List
                                    dataSource={api_task.data?.issues}
                                    renderItem={(issue, index) => (
                                       <List.Item
                                          className={cn(index === 0 && "pt-0")}
                                          onClick={() => control_issueViewDetailsDrawer.current?.handleOpen({ issue })}
                                          actions={[<Button key={"details"} icon={<RightOutlined />} type={"text"} />]}
                                       >
                                          <List.Item.Meta
                                             title={<div className={"text-base"}>{issue.typeError.name}</div>}
                                             description={
                                                <Space
                                                   className={"text-sm"}
                                                   split={<Divider type={"vertical"} className={"m-0"} />}
                                                >
                                                   <div
                                                      className={cn(
                                                         "flex items-center gap-2",
                                                         FixTypeTagMapper[issue.fixType].className,
                                                      )}
                                                   >
                                                      {FixTypeTagMapper[issue.fixType].icon}
                                                      {FixTypeTagMapper[issue.fixType].text}
                                                   </div>
                                                   {issue.issueSpareParts && issue.issueSpareParts.length > 0 && (
                                                      <div className={"flex items-center gap-2"}>
                                                         <Wrench size={16} weight={"fill"} />
                                                         {issue.issueSpareParts.length} linh kiện
                                                      </div>
                                                   )}
                                                </Space>
                                             }
                                             avatar={
                                                <Avatar
                                                   size={"small"}
                                                   className={cn(
                                                      issue.status === IssueStatusEnum.PENDING && "bg-neutral-500",
                                                      issue.status === IssueStatusEnum.RESOLVED && "bg-green-500",
                                                      issue.status === IssueStatusEnum.FAILED && "bg-red-500",
                                                      issue.status === IssueStatusEnum.CANCELLED && "bg-gray-500",
                                                   )}
                                                   icon={
                                                      issue.status === IssueStatusEnum.PENDING ? (
                                                         <MinusOutlined />
                                                      ) : issue.status === IssueStatusEnum.RESOLVED ? (
                                                         <CheckOutlined />
                                                      ) : issue.status === IssueStatusEnum.FAILED ? (
                                                         <ExclamationOutlined />
                                                      ) : (
                                                         <CloseOutlined />
                                                      )
                                                   }
                                                />
                                             }
                                          />
                                       </List.Item>
                                    )}
                                 />
                              </div>
                           ),
                        },
                        {
                           label: "Linh kiện",
                           key: "spare-parts",
                           children: (
                              <div>
                                 {issueSpareParts.length > 0 ? (
                                    <List
                                       dataSource={issueSpareParts}
                                       grid={{
                                          column: 2,
                                          gutter: 5,
                                       }}
                                       split
                                       renderItem={(item, index) => (
                                          <List.Item className={cn(index === 0 && "pt-0")}>
                                             <List.Item.Meta
                                                title={
                                                   <div className={"line-clamp-2 text-sm"}>{item.sparePart.name}</div>
                                                }
                                                description={<div className={"text-sm"}>x{item.quantity}</div>}
                                             />
                                          </List.Item>
                                       )}
                                    />
                                 ) : (
                                    <Empty description="Lỗi này không có linh kiện" />
                                 )}
                              </div>
                           ),
                        },
                     ]}
                  />
               )}
            </section>
            <footer className={"absolute bottom-0 left-0 w-full bg-white p-layout shadow-fb"}>
               {hasDoneAllIssues && (
                  <Button
                     block
                     type={"primary"}
                     size={"large"}
                     onClick={() =>
                        api_task.isSuccess &&
                        control_finishTaskDrawer.current?.handleOpen({
                           task: api_task.data,
                        })
                     }
                  >
                     Hoàn thành tác vụ
                  </Button>
               )}

               {allIssuesResolved ||
                  (hasDoneAllIssues && hasReturnedSpareParts && hasFailedIssueWithoutSparePart && (
                     <Button
                        block
                        type={"primary"}
                        size={"large"}
                        onClick={() =>
                           api_task.isSuccess &&
                           control_finishTaskDrawer.current?.handleOpen({
                              task: api_task.data,
                           })
                        }
                     >
                        Hoàn thành tác vụ
                     </Button>
                  ))}
               {!hasReturnedSpareParts && hasFailedIssueWithSparePart && (
                  <Button
                     block
                     type={"primary"}
                     size={"large"}
                     onClick={() =>
                        api_task.isSuccess &&
                        control_returnSparePartDrawer.current?.handleOpen({
                           task: api_task.data,
                           returnSpareParts: api_task.data.issues
                              .filter(
                                 (i) =>
                                    i.issueSpareParts.length > 0 &&
                                    i.status === IssueStatusEnum.FAILED &&
                                    !i.returnSparePartsStockkeeperSignature &&
                                    !i.returnSparePartsStaffSignature,
                              )
                              .flatMap((i) => i.issueSpareParts),
                        })
                     }
                  >
                     Trả linh kiện
                  </Button>
               )}
            </footer>
         </div>
         <OverlayControllerWithRef ref={control_issueViewDetailsDrawer}>
            <IssueViewDetailsDrawer refetchFn={api_task.refetch} />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_finishTaskDrawer}>
            <FinishTaskDrawer
               onSuccess={() => router.push(staff_uri.navbar.tasks + `?completed=${api_task.data?.name}`)}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_returnSparePartDrawer}>
            <ReturnSparePartDrawer
               onFinish={async () => {
                  await api_task.refetch()
                  control_returnSparePartDrawer.current?.handleClose()
               }}
            />
         </OverlayControllerWithRef>
      </ConfigProvider>
   )
}

export default Page
