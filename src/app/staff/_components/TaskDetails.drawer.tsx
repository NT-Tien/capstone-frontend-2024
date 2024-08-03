import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_OneById from "@/app/staff/_api/task/one-byId.api"
import Staff_Task_ReceiveSpareParts from "@/app/staff/_api/task/receive-spare-parts.api"
import Staff_Task_UpdateStart from "@/app/staff/_api/task/update-start.api"
import QrCodeDisplayModal from "@/app/staff/_components/QrCodeDisplay.modal"
import DataListView from "@/common/components/DataListView"
import { FixRequestStatusTagMapper } from "@/common/enum/fix-request-status.enum"
import { FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import useModalControls from "@/common/hooks/useModalControls"
import { cn } from "@/common/util/cn.util"
import { ProDescriptions } from "@ant-design/pro-components"
import { CheckCircle, Gear, MapPin } from "@phosphor-icons/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { App, Badge, Button, Card, Drawer, List, Tag } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { ReactNode, useMemo, useState } from "react"
import { IssueStatusEnumTagMapper } from "@/common/enum/issue-status.enum"

export default function TaskDetailsDrawer({
   children,
   showNextButton = true,
}: {
   children: (handleOpen: (taskId: string, shouldContinue?: boolean) => void) => ReactNode
   showNextButton?: boolean
}) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (taskId: string, shouldContinue?: boolean) => {
         setTaskId(taskId)
         setShouldContinue(shouldContinue ?? false)
      },
      onClose: () => {
         setTaskId(undefined)
         setShouldContinue(false)
      },
   })

   const [taskId, setTaskId] = useState<string | undefined>(undefined)
   const [shouldContinue, setShouldContinue] = useState<boolean>(false)
   const router = useRouter()
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const task = useQuery({
      queryKey: staff_qk.task.one_byId(taskId ?? ""),
      queryFn: () => Staff_Task_OneById({ id: taskId ?? "" }),
      enabled: !!taskId,
   })

   const hasSparePart = useMemo(() => {
      return task.data?.issues.find((issue) => issue.issueSpareParts.length !== 0)
   }, [task.data])

   const mutate_startTask = useMutation({
      mutationFn: Staff_Task_UpdateStart,
      onMutate: async () => {
         message.open({
            type: "loading",
            content: `Loading...`,
            key: `loading`,
         })
      },
      onError: async (error) => {
         message.error({
            content: "Đã xảy ra lỗi. Vui lòng thử lại.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: `Bắt đầu tác vụ.`,
         })
         await task.refetch()
      },
      onSettled: () => {
         message.destroy(`loading`)
      },
   })

   function handleStartTask() {
      if (!taskId) return
      if (shouldContinue) {
         router.push(`/staff/tasks/${taskId}/start`)
      } else {
         mutate_startTask.mutate(
            { id: taskId },
            {
               onSuccess: () => {
                  router.push(`/staff/tasks/${taskId}/start`)
               },
            },
         )
      }
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            placement={"bottom"}
            height="100%"
            title="Chi tiết tác vụ"
            classNames={{
               body: "overflow-auto p-0 std-layout pt-layout",
            }}
         >
            {hasSparePart && task.data?.confirmReceipt === false && (
               <Card size="small" className="mb-4">
                  Tác vụ này có linh kiện. Vui lòng xuống kho và nhấn nút bên dưới để tiếp tục.
               </Card>
            )}
            <ProDescriptions
               column={1}
               loading={task.isLoading}
               title={task.data?.name}
               dataSource={task.data}
               size="small"
               extra={task.data?.priority && <Tag color={"red"}>Ưu tiên</Tag>}
               columns={[
                  {
                     key: "1",
                     label: "Ngày tạo",
                     render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("DD/MM/YYYY - HH:mm"),
                  },
                  {
                     key: "2",
                     label: "Thông số kỹ thuật",
                     dataIndex: "operator",
                  },
                  {
                     key: "3",
                     label: "Tổng thời lượng",
                     render: (_, e) => `${e.totalTime} phút`,
                  },
                  {
                     key: "4",
                     label: "Ngày sửa",
                     render: (_, e) => dayjs(e.fixerDate).add(7, "hours").format("DD/MM/YYYY - HH:mm"),
                  },
                  ...(hasSparePart
                     ? [
                          {
                             key: "5",
                             label: "Linh kiện",
                             render: (_: any, e: any) => (
                                <Tag
                                   color={
                                      task.isSuccess
                                         ? task.data?.confirmReceipt === false
                                            ? "red"
                                            : "green"
                                         : "default"
                                   }
                                >
                                   {task.data?.confirmReceipt === false ? "Chưa lấy" : "Đã lấy"}
                                </Tag>
                             ),
                          },
                       ]
                     : []),
               ]}
            />
            <section className="std-layout-outer mt-layout rounded-lg bg-white">
               <h2 className="mb-2 px-layout text-base font-semibold">Chi tiết thiết bị</h2>
               <DataListView
                  dataSource={task.data?.device}
                  bordered
                  itemClassName="py-2 px-0"
                  labelClassName="font-normal text-neutral-500 text-sub-base"
                  valueClassName="text-sub-base"
                  items={[
                     {
                        label: "Mẫu máy",
                        value: (s) => s.machineModel?.name,
                     },
                     {
                        label: "Khu vực",
                        value: (s) => s.area?.name,
                     },
                     {
                        label: "Vị trí (x, y)",
                        value: (s) => (
                           <a className="flex items-center gap-1">
                              {s.positionX} x {s.positionY}
                              <MapPin size={16} weight="fill" />
                           </a>
                        ),
                     },
                     {
                        label: "Nhà sản xuất",
                        value: (s) => s.machineModel?.manufacturer,
                     },
                  ]}
               />
            </section>
            <section className="mt-layout">
               <h2 className="mb-2 text-base font-semibold">Vấn đề</h2>
               <List
                  dataSource={task.data?.issues}
                  grid={{
                     column: 1,
                     gutter: 10,
                  }}
                  renderItem={(item) => (
                     <Badge.Ribbon
                        text={IssueStatusEnumTagMapper[String(item.status)]?.text ?? "status"}
                        color={IssueStatusEnumTagMapper[String(item.status)]?.color ?? "red"}
                     >
                        <Card
                           className={cn("mb-2 w-full border-2 border-neutral-200 bg-transparent p-0 transition-all")}
                           classNames={{
                              body: "flex p-2.5 items-center",
                           }}
                        >
                           <div className="flex flex-grow flex-col">
                              <h3 className="font-medium">{item.typeError.name}</h3>
                              <span className={"mt-1 flex w-full items-center gap-1"}>
                                 <Tag color={FixTypeTagMapper[String(item.fixType)].colorInverse}>
                                    {FixTypeTagMapper[String(item.fixType)]?.text ?? "Status"}
                                 </Tag>
                                 <span className="w-52 flex-grow truncate text-neutral-400">{item.description}</span>
                              </span>
                           </div>
                        </Card>
                     </Badge.Ribbon>
                  )}
               />
            </section>
            <QrCodeDisplayModal
               title="Lấy linh kiện"
               description="Hãy xuống kho và đưa mã QR sau cho chủ kho."
               refetch={task.refetch}
            >
               {(handleOpen) => (
                  <section className="fixed bottom-0 left-0 w-full bg-white p-layout shadow-fb">
                     {showNextButton && (
                        <Button
                           disabled={!task.isSuccess}
                           className="w-full"
                           type="primary"
                           size="large"
                           onClick={() => {
                              if (!task.isSuccess) return
                              if (task.data.confirmReceipt || !hasSparePart) {
                                 handleStartTask()
                              } else {
                                 handleOpen(task.data.id, task.data.issues.map((issue) => issue.issueSpareParts).flat())
                              }
                           }}
                        >
                           <div className="flex items-center justify-center gap-2">
                              {task.data?.confirmReceipt === false && hasSparePart ? (
                                 <Gear size={20} />
                              ) : (
                                 <CheckCircle size={16} />
                              )}
                              {task.data?.confirmReceipt === false && hasSparePart
                                 ? "Lấy linh kiện"
                                 : shouldContinue
                                   ? "Tiếp tục tác vụ"
                                   : "Bắt đầu tác vụ"}
                           </div>
                        </Button>
                     )}
                  </section>
               )}
            </QrCodeDisplayModal>
         </Drawer>
      </>
   )
}
