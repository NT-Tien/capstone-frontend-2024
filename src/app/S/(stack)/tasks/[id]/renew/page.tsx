"use client"

import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import FinishTaskDrawer, { FinishTaskDrawerProps } from "@/features/staff/components/overlays/FinishTask.drawer"
import IssueViewDetails_WarrantyDrawer, {
   IssueViewDetails_WarrantyDrawerProps,
} from "@/features/staff/components/overlays/warranty/IssueViewDetails_Warranty.drawer"
import ReturnSparePartDrawer, {
   ReturnSparePartDrawerProps,
} from "@/features/staff/components/overlays/ReturnSparePart.drawer"
import staff_queries from "@/features/staff/queries"
import staff_uri from "@/features/staff/uri"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { RightOutlined } from "@ant-design/icons"
import { Calendar, ChartDonut, Clock, Gear, User } from "@phosphor-icons/react"
import { Avatar, Button, Card, ConfigProvider, Descriptions, Divider, Segmented, Space, Steps, Tabs } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import IssueViewDetails_RenewDrawer, {
   IssueViewDetails_RenewDrawerProps,
} from "@/features/staff/components/overlays/renew/IssueViewDetails_Renew.drawer"
import ReturnRemovedDevice, {
   ReturnRemovedDeviceProps,
} from "@/features/staff/components/overlays/renew/ReturnRemovedDevice.drawer"
import FinishRenewTaskDrawer, { FinishRenewTaskDrawerProps } from "@/features/staff/components/overlays/renew/FinishRenewTask.drawer"

function Page({ params }: { params: { id: string } }) {
   const router = useRouter()

   const control_issueViewDetails_RenewDrawer = useRef<RefType<IssueViewDetails_RenewDrawerProps>>(null)
   const control_finishRenewTaskDrawer = useRef<RefType<FinishRenewTaskDrawerProps>>(null)
   const control_returnRemovedDeviceDrawer = useRef<RefType<ReturnRemovedDeviceProps>>(null)

   const api_task = staff_queries.task.one({ id: params.id })

   const hasResolvedAllIssues = useMemo(() => {
      return api_task.data?.issues.every((i) => i.status !== IssueStatusEnum.PENDING)
   }, [api_task.data?.issues])

   const isDeviceLocationSet = useMemo(() => {
      return api_task.data?.device?.positionX !== null && api_task.data?.device?.positionY !== null
   }, [api_task.data?.device])

   const firstIssue = useMemo(() => {
      return TaskUtil.getTask_Renew_FirstIssue(api_task.data)
   }, [api_task.data])

   const secondIssue = useMemo(() => {
      return TaskUtil.getTask_Renew_SecondIssue(api_task.data)
   }, [api_task.data])

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

            <section className={"mt-layout px-layout"}>
               <Divider className="text-sm" orientation="left">
                  Tác vụ có {api_task.data?.issues.length} bước
               </Divider>
               <div>
                  <Steps
                     current={(function () {
                        if (
                           firstIssue?.status === IssueStatusEnum.PENDING ||
                           firstIssue?.status === IssueStatusEnum.FAILED
                        )
                           return 0
                        return 1
                     })()}
                     status={(function () {
                        if (firstIssue?.status === IssueStatusEnum.PENDING) return "process"
                        if (firstIssue?.status === IssueStatusEnum.FAILED) return "error"
                        if (firstIssue?.status === IssueStatusEnum.CANCELLED) return "error"

                        if (secondIssue?.status === IssueStatusEnum.PENDING) return "process"
                        if (secondIssue?.status === IssueStatusEnum.FAILED) return "error"
                        if (secondIssue?.status === IssueStatusEnum.CANCELLED) return "error"

                        return "finish"
                     })()}
                     className="steps-title-w-full"
                     items={[
                        {
                           className: cn(firstIssue?.status !== IssueStatusEnum.PENDING && "opacity-50"),
                           title: (
                              <div className="flex w-full justify-between">
                                 <div
                                    className={cn(
                                       "text-base font-semibold",
                                       firstIssue?.status !== IssueStatusEnum.PENDING && "line-through",
                                    )}
                                 >
                                    {firstIssue?.typeError.name}
                                 </div>
                                 <RightOutlined className="text-sm" />
                              </div>
                           ),
                           description: <div className="text-sm">{firstIssue?.typeError.description}</div>,
                           onClick: () => {
                              api_task.isSuccess &&
                                 control_issueViewDetails_RenewDrawer.current?.handleOpen({
                                    issue: firstIssue,
                                    machineModel: api_task.data.device.machineModel,
                                    request: api_task.data.request,
                                    task: api_task.data,
                                 })
                           },
                        },
                        {
                           className: cn(secondIssue?.status !== IssueStatusEnum.PENDING && "opacity-50"),
                           title: (
                              <div className="flex w-full justify-between">
                                 <div
                                    className={cn(
                                       "text-base font-semibold",
                                       secondIssue?.status !== IssueStatusEnum.PENDING && "line-through",
                                    )}
                                 >
                                    {secondIssue?.typeError.name}
                                 </div>
                                 <RightOutlined className="text-sm" />
                              </div>
                           ),
                           description: <div className="text-sm">{secondIssue?.typeError.description}</div>,
                           onClick: () => {
                              api_task.isSuccess &&
                                 control_issueViewDetails_RenewDrawer.current?.handleOpen({
                                    issue: secondIssue,
                                    machineModel: api_task.data.device.machineModel,
                                    request: api_task.data.request,
                                    isDisabled: firstIssue?.status === IssueStatusEnum.PENDING,
                                    task: api_task.data,
                                 })
                           },
                        },
                     ]}
                  />
               </div>
            </section>
            {hasResolvedAllIssues && (
               <footer className="absolute bottom-0 left-0 w-full bg-white p-layout shadow-fb">
                  {isDeviceLocationSet ? (
                     <Button
                        block
                        type="primary"
                        size="large"
                        onClick={() =>
                           api_task.isSuccess &&
                           control_returnRemovedDeviceDrawer.current?.handleOpen({
                              task: api_task.data,
                           })
                        }
                     >
                        Trả thiết bị
                     </Button>
                  ) : (
                     <Button
                        block
                        type="primary"
                        size="large"
                        onClick={() =>
                           api_task.isSuccess &&
                           control_finishRenewTaskDrawer.current?.handleOpen({
                              task: api_task.data,
                           })
                        }
                     >
                        Hoàn thành tác vụ
                     </Button>
                  )}
               </footer>
            )}
         </div>
         <OverlayControllerWithRef ref={control_issueViewDetails_RenewDrawer}>
            <IssueViewDetails_RenewDrawer refetchFn={api_task.refetch} />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_finishRenewTaskDrawer}>
            <FinishRenewTaskDrawer
               onSuccess={() => router.push(staff_uri.navbar.tasks + `?completed=${api_task.data?.name}`)}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_returnRemovedDeviceDrawer}>
            <ReturnRemovedDevice
               onFinish={async () => {
                  await api_task.refetch()
                  control_returnRemovedDeviceDrawer.current?.handleClose()
               }}
            />
         </OverlayControllerWithRef>
      </ConfigProvider>
   )
}

export default Page
