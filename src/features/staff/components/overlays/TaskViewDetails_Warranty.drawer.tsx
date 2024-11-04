import {
   App,
   Avatar,
   Button,
   Card,
   Descriptions,
   Divider,
   Drawer,
   DrawerProps,
   Dropdown,
   Image,
   List,
   Space,
   Tabs,
   Tag,
} from "antd"
import staff_queries from "@/features/staff/queries"
import staff_mutations from "@/features/staff/mutations"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import {
   CalendarOutlined,
   CheckOutlined,
   CloseOutlined,
   ExclamationOutlined,
   MinusCircleOutlined,
   MinusOutlined,
   MoreOutlined,
   RightOutlined,
} from "@ant-design/icons"
import AlertCard from "@/components/AlertCard"
import dayjs from "dayjs"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { cn } from "@/lib/utils/cn.util"
import { Calendar, ChartDonut, Clock, Export, Gear, User, Wrench } from "@phosphor-icons/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import GetSparePartsDrawer, {
   QrCodeDisplayModalRefType,
} from "@/features/staff/components/overlays/GetSparePartsDrawer"
import QrCodeDrawer, { QrCodeDrawerProps } from "@/components/overlays/QrCode.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { useRouter } from "next/navigation"
import staff_uri from "@/features/staff/uri"
import { clientEnv } from "@/env"
import ScannerV2Drawer, { ScannerV2DrawerRefType } from "@/components/overlays/ScannerV2.drawer"
import * as React from "react"

type TaskViewDetails_WarrantyDrawerProps = {
   taskId?: string
   refetchFn?: () => void
}
type Props = Omit<DrawerProps, "children"> & TaskViewDetails_WarrantyDrawerProps & { handleClose?: () => void }

function TaskViewDetails_WarrantyDrawer(props: Props) {
   const router = useRouter()
   const { message, notification } = App.useApp()

   const [tab, setTab] = useState<"issues" | "proof" | "spare-parts">("issues")
   const control_getSparePartsDrawer = useRef<QrCodeDisplayModalRefType | null>(null)
   const control_qrCodeDrawer = useRef<RefType<QrCodeDrawerProps>>(null)
   const control_scannerDrawerRef = useRef<ScannerV2DrawerRefType | null>(null)

   const api_task = staff_queries.task.one({ id: props.taskId ?? "" }, { enabled: !!props.taskId })
   const mutate_beginTask = staff_mutations.task.begin({ showMessages: false })
   const mutate_closeTask = staff_mutations.task.close({ showMessages: false })

   const hasSpareParts = useMemo(() => TaskUtil.hasSpareParts(api_task.data), [api_task.data])
   const hasTakenSpareParts = useMemo(() => TaskUtil.hasTakenSpareParts(api_task.data), [api_task.data])

   const issueSpareParts = useMemo(() => {
      if (!api_task.isSuccess) return
      return api_task.data.issues.flatMap((i) => i.issueSpareParts)
   }, [api_task.data?.issues, api_task.isSuccess])

   function onCloseWrapper(e: React.MouseEvent | React.KeyboardEvent) {
      props.onClose?.(e)
      if (
         api_task.data?.status === TaskStatus.ASSIGNED &&
         api_task.data?.issues.every((i) => i.status === IssueStatusEnum.FAILED)
      ) {
         api_task.isSuccess &&
            mutate_closeTask.mutate(
               {
                  id: api_task.data.id,
               },
               {
                  onSuccess: () => {
                     notification.info({
                        message: "Thành công",
                        description: `Tác vụ ${api_task.data.name} đã được tự động đóng.`,
                     })
                     props.refetchFn?.()
                  },
               },
            )
      }
   }

   function Footer() {
      // task hasnt started and all issues failed
      if (
         api_task.data?.status === TaskStatus.ASSIGNED &&
         api_task.data?.issues.every((i) => i.status === IssueStatusEnum.FAILED)
      ) {
         return (
            <div>
               <AlertCard text="Tác vụ này không thể hoàn thiện được. Vui lòng đóng tác vụ." className="mb-layout" />
               <Button block type={"primary"} size={"large"} onClick={() => props.handleClose?.()}>
                  Đóng tác vụ
               </Button>
            </div>
         )
      }

      // in progress
      if (api_task.data?.status === TaskStatus.IN_PROGRESS) {
         return (
            <Button
               block
               type={"primary"}
               size={"large"}
               onClick={() => api_task.isSuccess && router.push(staff_uri.stack.tasks_id_warranty(api_task.data.id))}
            >
               Tiếp tục tác vụ
            </Button>
         )
      }

      if (api_task.data?.status === TaskStatus.HEAD_STAFF_CONFIRM) {
         return <AlertCard text="Tác vụ này đang chờ trưởng phòng sửa chữa kiểm tra" type={"info"} />
      }

      // no spare parts or has taken spare parts
      if ((hasSpareParts === false || hasTakenSpareParts === true) && api_task.data?.status === TaskStatus.ASSIGNED) {
         return (
            <Button
               block
               type={"primary"}
               size={"large"}
               onClick={() => {
                  if (TaskUtil.isTask_Warranty(api_task.data, "send")) {
                     control_scannerDrawerRef.current?.handleOpen()
                  } else {
                     api_task.isSuccess &&
                        mutate_beginTask.mutate(
                           {
                              id: api_task.data.id,
                           },
                           {
                              onSuccess: () => {
                                 router.push(staff_uri.stack.tasks_id_warranty(api_task.data.id))
                              },
                           },
                        )
                  }
               }}
            >
               Bắt đầu tác vụ
            </Button>
         )
      }
   }

   useEffect(() => {
      if (!props.open) setTab("issues")
   }, [props.open])

   return (
      <>
         <Drawer
            title={
               <div className="mb-layout flex items-start justify-between gap-2">
                  <div>
                     <h1 className="text-lg font-semibold text-black">Thông tin tác vụ</h1>
                     <p className="text-sm font-medium text-neutral-500">{api_task.data?.name ?? "Đang tải..."}</p>
                     {api_task.isSuccess && (
                        <div className="mt-2">{api_task.data.priority && <Tag color="red">Ưu tiên</Tag>}</div>
                     )}
                  </div>
                  <Button size="middle" type="text" icon={<CloseOutlined />} onClick={onCloseWrapper}></Button>
               </div>
            }
            classNames={{ header: "border-none pb-0", body: "pt-0", footer: "p-layout" }}
            closeIcon={null}
            placement={"bottom"}
            height={"100%"}
            footer={<Footer />}
            loading={api_task.isPending}
            onClose={onCloseWrapper}
            {...props}
         >
            {api_task.isSuccess && (
               <>
                  <Descriptions
                     labelStyle={{
                        width: "170px",
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
                        ...(hasSpareParts === true
                           ? [
                                {
                                   label: (
                                      <div className={"flex items-center gap-2"}>
                                         <Export size={18} weight={"fill"} />
                                         <span>Linh kiện</span>
                                      </div>
                                   ),
                                   children: api_task.data.confirmReceipt ? (
                                      <div className={"text-green-500"}>Đã lấy</div>
                                   ) : (
                                      <div className={"text-red-500"}>Chưa lấy</div>
                                   ),
                                },
                             ]
                           : []),
                        {
                           label: (
                              <div className={"flex items-center gap-1"}>
                                 <Gear size={18} weight={"fill"} />
                                 <span>Thiết bị:</span>
                              </div>
                           ),
                           span: 2,
                           className: "*:flex-col",
                           children: (
                              <Card size={"small"} className="mt-3 w-full bg-[#FF6B00] text-white">
                                 <div className={"flex items-center gap-2"}>
                                    <div className={"flex-grow"}>
                                       <Space
                                          className={"text-xs"}
                                          split={<Divider type={"vertical"} className={"m-0"} />}
                                       >
                                          {api_task.data.device.machineModel.manufacturer}
                                          <span>
                                             Khu vực {api_task.data.device.area.name} ({api_task.data.device.positionX},{" "}
                                             {api_task.data.device.positionY})
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
                           ),
                        },
                     ]}
                  />
                  <section className={"mt-6"}>
                     <h3 className={"mb-2 text-lg font-semibold text-neutral-500"}>
                        Tác vụ có {api_task.data.issues.length ?? "-"} bước:
                     </h3>
                     <List
                        dataSource={api_task.data.issues}
                        renderItem={(issue, index) => (
                           <List.Item className={cn(index === 0 && "pt-0")}>
                              <List.Item.Meta
                                 title={<div className={"text-base"}>{issue.typeError.name}</div>}
                                 description={
                                    <Space
                                       className={"text-sm"}
                                       split={<Divider type={"vertical"} className={"m-0"} />}
                                    >
                                       <div>{issue.typeError.description}</div>
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
                  </section>
               </>
            )}
         </Drawer>
         <GetSparePartsDrawer
            title="Lấy linh kiện"
            description="Hãy xuống kho và đưa mã QR sau cho chủ kho."
            refetch={() => api_task.refetch()}
            ref={control_getSparePartsDrawer}
            onComplete={() => {}}
         />
         <OverlayControllerWithRef ref={control_qrCodeDrawer}>
            <QrCodeDrawer placement="bottom" height="50%" title={"Mã QR Tác vụ"} />
         </OverlayControllerWithRef>
         <ScannerV2Drawer
            alertText="Vui lòng quét mã QR trên thiết bị để bắt đầu tác vụ."
            onScan={(result) => {
               if (result !== api_task.data?.device.id) {
                  message.error({
                     content: "Mã QR không đúng. Vui lòng thử lại.",
                  })
                  return
               }
               api_task.isSuccess &&
                  mutate_beginTask.mutate(
                     {
                        id: api_task.data.id,
                     },
                     {
                        onSuccess: () => {
                           router.push(staff_uri.stack.tasks_id_warranty(api_task.data.id))
                        },
                     },
                  )
            }}
            ref={control_scannerDrawerRef}
         />
      </>
   )
}

export default TaskViewDetails_WarrantyDrawer
export type { TaskViewDetails_WarrantyDrawerProps }
