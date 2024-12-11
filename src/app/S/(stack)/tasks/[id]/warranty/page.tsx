"use client"

import ClickableArea from "@/components/ClickableArea"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import FinishTaskDrawer, { FinishTaskDrawerProps } from "@/features/staff/components/overlays/FinishTask.drawer"
import QrCodeDisplayForRenewModal, {
   QrCodeDisplayForRenewModalRefType,
} from "@/features/staff/components/overlays/renew/QrCodeDisplayForRenew.modal"
import IssueViewDetails_WarrantyDrawer, {
   IssueViewDetails_WarrantyDrawerProps,
} from "@/features/staff/components/overlays/warranty/IssueViewDetails_Warranty.drawer"
import staff_mutations from "@/features/staff/mutations"
import staff_queries from "@/features/staff/queries"
import staff_uri from "@/features/staff/uri"
import { DismantleReplacementDeviceTypeErrorId } from "@/lib/constants/Warranty"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { TaskType } from "@/lib/domain/Task/Task.dto"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { CheckOutlined, CloseOutlined, RightOutlined } from "@ant-design/icons"
import { Calendar, ChartDonut, Clock, Gear, User } from "@phosphor-icons/react"
import { Avatar, Button, Card, Descriptions, Divider, Space, Steps } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef } from "react"

function Page({ params }: { params: { id: string } }) {
   const router = useRouter()

   const control_issueViewDetails_WarrantyDrawer = useRef<RefType<IssueViewDetails_WarrantyDrawerProps>>(null)
   const control_finishTaskDrawer = useRef<RefType<FinishTaskDrawerProps>>(null)
   const control_returnDeviceQrCode = useRef<QrCodeDisplayForRenewModalRefType>(null)

   const api_task = staff_queries.task.one({ id: params.id })

   const mutate_beginTask = staff_mutations.task.begin({ showMessages: false })

   const hasResolvedAllIssues = useMemo(() => {
      return api_task.data?.issues.every((i) => i.status !== IssueStatusEnum.PENDING)
   }, [api_task.data?.issues])

   const issues = useMemo(() => {
      return TaskUtil.getTask_Warranty_IssuesOrdered(api_task.data)
   }, [api_task.data])

   useEffect(() => {
      if (api_task.data?.status === TaskStatus.ASSIGNED) {
         mutate_beginTask.mutate(
            { id: params.id },
            {
               onSettled: () => {
                  api_task.refetch()
               },
            },
         )
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [api_task.isSuccess])

   return (
      <>
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
                                    Khu vực {api_task.data.device?.area?.name ?? "-"} (
                                    {api_task.data.device?.positionX ?? "-"}, {api_task.data.device?.positionY ?? "-"})
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

            <section className={"mt-4 px-layout"}>
               <header className="mb-4 text-center">
                  <Divider className="m-0 text-base font-semibold">Chi tiết tác vụ</Divider>
                  <p className="font-base text-sm text-neutral-500">
                     Tác vụ có {api_task.data?.issues.length} bước cần được thực hiện
                  </p>
               </header>
               <div>
                  <div className="flex flex-col shadow-sm">
                     {issues?.map((i, index, array) => {
                        const isCurrentIssue =
                           (array[index - 1]?.status === IssueStatusEnum.RESOLVED || array[index - 1] === undefined) &&
                           (array[index + 1]?.status === IssueStatusEnum.PENDING || array[index + 1] === undefined) &&
                           i.status === IssueStatusEnum.PENDING

                        const isResolvedIssue = i.status === IssueStatusEnum.RESOLVED
                        const isFailedIssue = i.status === IssueStatusEnum.FAILED

                        const isUpcomingIssue = array[index - 1]?.status === IssueStatusEnum.PENDING && !isCurrentIssue

                        return (
                           <>
                              <ClickableArea
                                 reset
                                 key={i.id}
                                 className={cn(
                                    "flex items-start justify-start gap-3 px-3 py-3",
                                    index === 0 && "rounded-t-lg",
                                    index === array.length - 1 && "rounded-b-lg",
                                    isUpcomingIssue && "opacity-30",
                                    isResolvedIssue && "bg-green-100 opacity-70",
                                 )}
                                 onClick={() =>
                                    api_task.isSuccess &&
                                    control_issueViewDetails_WarrantyDrawer.current?.handleOpen({
                                       issue: i,
                                       machineModel: api_task.data.device.machineModel,
                                       request: api_task.data.request,
                                       task: api_task.data,
                                       isDisabled: isUpcomingIssue,
                                    })
                                 }
                              >
                                 <div
                                    className={cn(
                                       "grid size-7 flex-shrink-0 place-items-center rounded-full bg-neutral-300 text-sm font-medium text-white",
                                       isResolvedIssue && "bg-green-500",
                                       isCurrentIssue && "bg-orange-500",
                                    )}
                                 >
                                    {isResolvedIssue && <CheckOutlined />}
                                    {isFailedIssue && <CloseOutlined />}
                                    {(isUpcomingIssue || isCurrentIssue) && index + 1}
                                 </div>
                                 <main className="pt-0.5">
                                    <header className="flex gap-3">
                                       <h2
                                          className={cn(
                                             "mr-auto line-clamp-1 whitespace-pre-wrap text-base font-bold",
                                             isResolvedIssue && "text-green-500 line-through",
                                          )}
                                       >
                                          {i.typeError.name}
                                       </h2>
                                       <RightOutlined
                                          className={cn("text-sm text-orange-500", isResolvedIssue && "text-green-500")}
                                       />
                                    </header>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-400">
                                       {i.typeError.description}
                                    </p>
                                 </main>
                              </ClickableArea>
                              {index !== array.length - 1 && <Divider className="m-0" />}
                           </>
                        )
                     })}
                  </div>
               </div>
            </section>

            {hasResolvedAllIssues && (
               <footer className={"fixed bottom-0 left-0 w-full bg-white p-layout shadow-fb"}>
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
               </footer>
            )}

            {/* {hasResolvedAllIssues &&
               (shouldReturnDevice ? (
                  hasReturnedDevice ? (
                     <footer className={"fixed bottom-0 left-0 w-full bg-white p-layout shadow-fb"}>
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
                     </footer>
                  ) : (
                     <footer className={"fixed bottom-0 left-0 w-full bg-white p-layout shadow-fb"}>
                        <Button
                           block
                           type={"primary"}
                           size={"large"}
                           onClick={() =>
                              api_task.isSuccess && control_returnDeviceQrCode.current?.handleOpen(api_task.data?.id)
                           }
                        >
                           Trả thiết bị thay thế
                        </Button>
                     </footer>
                  )
               ) : (
                  <footer className={"fixed bottom-0 left-0 w-full bg-white p-layout shadow-fb"}>
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
                  </footer>
               ))} */}
         </div>
         <OverlayControllerWithRef ref={control_issueViewDetails_WarrantyDrawer}>
            <IssueViewDetails_WarrantyDrawer
               refetchFn={api_task.refetch}
               // autoOpenComplete={() => control_finishTaskDrawer.current?.handleOpen({ task: api_task.data })}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_finishTaskDrawer}>
            <FinishTaskDrawer
               onSuccess={() => router.push(staff_uri.navbar.tasks + `?completed=${api_task.data?.name}`)}
            />
         </OverlayControllerWithRef>
         <QrCodeDisplayForRenewModal refetch={() => api_task.refetch()} ref={control_returnDeviceQrCode} />
      </>
   )
}

export default Page
