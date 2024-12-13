import { App, Avatar, Button, Card, Descriptions, Divider, Drawer, DrawerProps, List, Space, Steps, Tag } from "antd"
import staff_queries from "@/features/staff/queries"
import staff_mutations from "@/features/staff/mutations"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { CheckOutlined, CloseOutlined, ExclamationOutlined, MinusOutlined } from "@ant-design/icons"
import AlertCard from "@/components/AlertCard"
import dayjs from "dayjs"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { cn } from "@/lib/utils/cn.util"
import { Calendar, ChartDonut, Clock, Export, Gear, Ticket, User } from "@phosphor-icons/react"
import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import GetSparePartsDrawer, {
   QrCodeDisplayModalRefType,
} from "@/features/staff/components/overlays/GetSparePartsDrawer"
import QrCodeDrawer, { QrCodeDrawerProps } from "@/components/overlays/QrCode.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { useRouter } from "next/navigation"
import staff_uri from "@/features/staff/uri"
import ScannerV2Drawer, { ScannerV2DrawerRefType } from "@/components/overlays/ScannerV2.drawer"
import useScanQrCodeDrawer from "@/lib/hooks/useScanQrCodeDrawer"
import { ExportStatus, ExportStatusMapper } from "@/lib/domain/ExportWarehouse/ExportStatus.enum"
import QrCodeDisplayForRenewModal, {
   QrCodeDisplayForRenewModalRefType,
} from "@/features/staff/components/overlays/renew/QrCodeDisplayForRenew.modal"
import { useQueryClient } from "@tanstack/react-query"

type TaskViewDetails_WarrantyDrawerProps = {
   taskId?: string
   refetchFn?: () => void
}
type Props = Omit<DrawerProps, "children"> & TaskViewDetails_WarrantyDrawerProps & { handleClose?: () => void }

function TaskViewDetails_WarrantyDrawer(props: Props) {
   const router = useRouter()
   const queryClient = useQueryClient()
   const { message, notification } = App.useApp()
   const control_scannerDrawer = useScanQrCodeDrawer({
      validationFn: async (result) => {
         if (!api_task.isSuccess) throw new Error("Task not fetched")
         if (result !== api_task.data.device.id) {
            message.error("Mã QR không đúng. Vui lòng thử lại.")
            return false
         }
         return true
      },
      closeOnScan: false,
      onSuccess() {
         if (!api_task.isSuccess) throw new Error("Task not fetched")
         router.push(staff_uri.stack.tasks_id_warranty(api_task.data.id))
      },
      onError(error) {
         if (error instanceof Error && error.message === "Task not fetched") {
            message.error("Đã có lỗi xảy ra. Vui lòng thử lại.")
         }
      },
      infoText: "Vui lòng đặt mã QR thiết bị vào ô bên dưới",
   })
   const control_qrCodeDisplayDrawer = useRef<QrCodeDisplayForRenewModalRefType>(null)

   const api_task = staff_queries.task.one({ id: props.taskId ?? "" }, { enabled: !!props.taskId })
   const api_task_inProgress = staff_queries.task.allInProgress(
      {},
      {
         select: (data) => data.filter((i) => i.id !== props.taskId),
         enabled: !!props.taskId,
      },
   )

   const mutate_closeTask = staff_mutations.task.close({ showMessages: false })

   const issues = useMemo(() => {
      return TaskUtil.getTask_Warranty_IssuesOrdered(api_task.data)
   }, [api_task.data])

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
      // exists another in progress task
      if (!api_task_inProgress.isSuccess || !api_task.isSuccess) return
      if (api_task_inProgress.data.length > 0) {
         return (
            <AlertCard text="Vui lòng hoàn thành tất cả các tác vụ đang thực hiện để bắt đầu tác vụ này" type="info" />
         )
      }

      // disable if in future
      if (dayjs().isBefore(dayjs(api_task.data.fixerDate))) {
         return <AlertCard text="Tác vụ này chưa đến ngày thực hiện" type="info" />
      }

      // if task has export warehouse that is not exported
      if (api_task.data.export_warehouse_ticket.length > 0) {
         if (api_task.data.export_warehouse_ticket[0].status === ExportStatus.WAITING) {
            return <AlertCard text="Tác vụ đang chờ đơn xuất kho" type="info" />
         }
         if (api_task.data.export_warehouse_ticket[0].status === ExportStatus.ACCEPTED) {
            return (
               <Button
                  type="primary"
                  block
                  onClick={() =>
                     control_qrCodeDisplayDrawer.current?.handleOpen(api_task.data.id, api_task.data.device_renew)
                  }
               >
                  Lấy thiết bị từ kho
               </Button>
            )
         }
      }

      // task hasnt started and all issues failed
      if (
         api_task.data?.status === TaskStatus.ASSIGNED &&
         api_task.data?.issues.every((i) => i.status === IssueStatusEnum.FAILED)
      ) {
         return (
            <div>
               <AlertCard text="Tác vụ này không thể hoàn thiện được. Vui lòng đóng tác vụ." className="mb-layout" />
               <Button block type={"primary"} onClick={() => props.handleClose?.()}>
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
               onClick={() => api_task.isSuccess && router.push(staff_uri.stack.tasks_id_warranty(api_task.data.id))}
            >
               Tiếp tục tác vụ
            </Button>
         )
      }

      if (api_task.data?.status === TaskStatus.HEAD_STAFF_CONFIRM) {
         return <AlertCard text="Tác vụ này đang chờ trưởng phòng sửa chữa kiểm tra" type={"info"} />
      }

      if (api_task.data?.status === TaskStatus.ASSIGNED) {
         return (
            <Button
               block
               type={"primary"}
               onClick={() => {
                  if (TaskUtil.isTask_Warranty(api_task.data, "send")) {
                     control_scannerDrawer.handleOpenScanner()
                  } else {
                     api_task.isSuccess && router.push(staff_uri.stack.tasks_id_warranty(api_task.data.id))
                  }
               }}
            >
               Bắt đầu tác vụ
            </Button>
         )
      }
   }

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
                                 <span>Ngày làm</span>
                              </div>
                           ),
                           children: dayjs(api_task.data.fixerDate).format("DD/MM/YYYY"),
                        },
                        {
                           label: (
                              <div className={"flex items-center gap-2"}>
                                 <User size={18} weight={"fill"} />
                                 <span>Người làm</span>
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
                        ...(api_task.data.export_warehouse_ticket.length > 0
                           ? [
                                {
                                   label: (
                                      <div className={"flex items-center gap-2"}>
                                         <Ticket size={18} weight={"fill"} />
                                         <span>Đơn xuất kho</span>
                                      </div>
                                   ),
                                   children: (
                                      <div className={"flex items-center gap-2"}>
                                         {ExportStatusMapper(api_task.data.export_warehouse_ticket[0].status)?.text}
                                      </div>
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
                                             Khu vực{" "}
                                             {api_task.data.device?.area?.name ??
                                                api_task.data.request.old_device.area.name ??
                                                "-"}{" "}
                                             (
                                             {api_task.data.device?.positionX ??
                                                api_task.data.request.old_device.positionX ??
                                                "-"}
                                             ,{" "}
                                             {api_task.data.device?.positionY ??
                                                api_task.data.request.old_device.positionY ??
                                                "-"}
                                             )
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
                  <Divider />
                  <section>
                     <h3 className={"mb-1 text-base font-semibold text-black"}>Chi tiết tác vụ</h3>
                     <p className="mb-4 font-base text-sm text-neutral-500">
                        Tác vụ có {api_task.data.issues.length ?? "-"} bước cần thực hiện
                     </p>
                     <Steps
                        items={issues?.map((i) => ({
                           title: <div className="text-base font-medium">{i?.typeError.name}</div>,
                           description: <div className="text-sm">{i?.typeError.description}</div>,
                           status: (function () {
                              switch (i?.status) {
                                 case IssueStatusEnum.PENDING:
                                    return "wait"
                                 case IssueStatusEnum.RESOLVED:
                                    return "finish"
                                 case IssueStatusEnum.FAILED:
                                    return "error"
                                 case IssueStatusEnum.CANCELLED:
                                    return "error"
                                 default:
                                    return "wait"
                              }
                           })(),
                        }))}
                     />
                  </section>
               </>
            )}
         </Drawer>
         <QrCodeDisplayForRenewModal
            refetch={() => api_task.refetch()}
            ref={control_qrCodeDisplayDrawer}
            onComplete={() => {
               props.handleClose?.()
               queryClient.invalidateQueries({
                  queryKey: ["staff", "task", "all-by-date"],
               })
            }}
         />

         {control_scannerDrawer.contextHolder()}
      </>
   )
}

export default TaskViewDetails_WarrantyDrawer
export type { TaskViewDetails_WarrantyDrawerProps }
