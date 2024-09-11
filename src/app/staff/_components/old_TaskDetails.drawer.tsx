import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_OneById from "@/app/staff/_api/task/one-byId.api"
import Staff_Task_UpdateStart from "@/app/staff/_api/task/update-start.api"
import QrCodeDisplayModal, { QrCodeDisplayModalRefType } from "@/app/staff/_components/QrCodeDisplay.modal"
import DataListView from "@/components/DataListView"
import { FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/common/enum/issue-status.enum"
import { TaskStatus } from "@/common/enum/task-status.enum"
import useModalControls from "@/common/hooks/useModalControls"
import { cn } from "@/common/util/cn.util"
import { ReceiveWarrantyTypeErrorId } from "@/constants/Warranty"
import { ProDescriptions } from "@ant-design/pro-components"
import { CheckCircle, Gear, MapPin } from "@phosphor-icons/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Badge, Button, Card, Drawer, Image, List, Tag } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { ReactNode, useMemo, useRef, useState } from "react"
import { clientEnv } from "../../../env"

export default function TaskDetailsDrawer({
   children,
   showNextButton = true,
   hideButtons = false,
}: {
   children: (handleOpen: (taskId: string, shouldContinue?: boolean) => void) => ReactNode
   showNextButton?: boolean
   hideButtons?: boolean
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

   const qrCodeDisplayRef = useRef<QrCodeDisplayModalRefType | null>(null)

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

   // useEffect(() => {
   //    if (task.data?.confirmReceipt === true && task.data.issues.find((issue) => issue.issueSpareParts.length !== 0)) {
   //       qrCodeDisplayRef.current?.handleClose()
   //    }
   // }, [task.data?.confirmReceipt, task.data?.issues])

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
               body: "overflow-y-auto p-0 std-layout pt-layout pb-32",
            }}
         >
            {hasSparePart && task.data?.confirmReceipt === false && (
               <Card size="small" className="mb-4">
                  Tác vụ này có linh kiện. Vui lòng xuống kho và nhấn nút bên dưới để tiếp tục.
               </Card>
            )}
            <ProDescriptions
               column={1}
               className="w-full"
               loading={task.isLoading}
               title={
                  <div>
                     <h3 className="whitespace-pre-wrap">{task.data?.name}</h3>
                     {task.isSuccess &&
                        new Set([TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.CANCELLED]).has(
                           task.data.status,
                        ) && (
                           <Tag>
                              {Math.floor(
                                 task.data.issues.reduce(
                                    (acc, prev) => acc + (prev.status === IssueStatusEnum.RESOLVED ? 1 : 0),
                                    0,
                                 ) / task.data.issues.length,
                              )}
                              % hoàn thành
                           </Tag>
                        )}
                  </div>
               }
               dataSource={task.data}
               size="small"
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
                     key: "priority",
                     label: "Mức độ",
                     render: (_, e) =>
                        e.priority ? <Tag color="red">{"Uư tiên"}</Tag> : <Tag color="green">{"Bình thường"}</Tag>,
                  },
                  {
                     key: "4",
                     label: "Ngày sửa",
                     render: (_, e) => dayjs(e.fixerDate).add(7, "hours").format("DD/MM/YYYY"),
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
            {(task.data?.status === TaskStatus.HEAD_STAFF_CONFIRM || task.data?.status === TaskStatus.COMPLETED) && (
               <section className="my-layout">
                  <Card>
                     <section>
                        <h2 className="mb-2 text-base font-medium">Hình ảnh minh chứng</h2>
                        <div className="flex items-center gap-2">
                           {task.isSuccess && (
                              <Image
                                 src={clientEnv.BACKEND_URL + `/file-image/${task.data.imagesVerify?.[0]}`}
                                 alt="image"
                                 className="h-20 w-20 rounded-lg"
                              />
                           )}
                           <div className="grid h-20 w-20 place-content-center rounded-lg border-2 border-dashed border-neutral-200"></div>
                           <div className="grid h-20 w-20 place-content-center rounded-lg border-2 border-dashed border-neutral-200"></div>
                        </div>
                     </section>
                     <section className="mt-4">
                        <h2 className="mb-2 text-base font-medium">Video minh chứng</h2>
                        {task.isSuccess ? (
                           !!task.data.videosVerify ? (
                              <video width="100%" height="240" controls>
                                 <source
                                    src={clientEnv.BACKEND_URL + `/file-video/${task.data.videosVerify}`}
                                    type="video/mp4"
                                 />
                              </video>
                           ) : (
                              <div className="grid h-20 w-full place-content-center rounded-lg bg-neutral-100">
                                 Không có
                              </div>
                           )
                        ) : null}
                     </section>
                  </Card>
               </section>
            )}
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
            {!hideButtons && (
               <QrCodeDisplayModal
                  title="Lấy linh kiện"
                  description="Hãy xuống kho và đưa mã QR sau cho chủ kho."
                  refetch={task.refetch}
                  ref={qrCodeDisplayRef}
               >
                  {(handleOpen) =>
                     showNextButton && (
                        <section className="fixed bottom-0 left-0 w-full bg-white p-layout shadow-fb">
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
                                    handleOpen(
                                       task.data.id,
                                       task.data.issues.map((issue) => issue.issueSpareParts).flat(),
                                       !!task.data.issues.find(
                                          (issue) => issue.typeError.id === ReceiveWarrantyTypeErrorId,
                                       ),
                                    )
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
                        </section>
                     )
                  }
               </QrCodeDisplayModal>
            )}
         </Drawer>
      </>
   )
}
