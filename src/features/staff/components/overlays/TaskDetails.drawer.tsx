import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import useModalControls from "@/lib/hooks/useModalControls"
import AlertCard from "@/components/AlertCard"
import { CloseOutlined } from "@ant-design/icons"
import { Gear, MapPin, Package, Wrench } from "@phosphor-icons/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Button, Card, Descriptions, Divider, Drawer, Empty, Result, Spin, Tag } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { forwardRef, ReactNode, useImperativeHandle, useMemo, useRef, useState } from "react"
import staff_qk from "../../api/qk"
import Staff_Task_OneById from "../../api/task/one-byId.api"
import GetSparePartsDrawer, { QrCodeDisplayModalRefType } from "./GetSparePartsDrawer"
import Staff_Task_UpdateStart from "../../api/task/update-start.api"
import ScannerV2Drawer, { ScannerV2DrawerRefType } from "@/components/overlays/ScannerV2.drawer"
import { ReceiveWarrantyTypeErrorId, RenewRequestTypeErrorId } from "@/lib/constants/Warranty"
import QrCodeDisplayForRenewModal, {
   QrCodeDisplayForRenewModalRefType,
} from "@/features/staff/components/overlays/QrCodeDisplayForRenew.modal"
import staff_mutations from "@/features/staff/mutations"

type HandleOpenProps = {
   taskId: string
}

export type TaskDetailsDrawerRefType = {
   handleOpen: (props: HandleOpenProps) => void
}

type Props = {
   children?: (handleOpen: (props: HandleOpenProps) => void) => ReactNode
   refetchFn?: () => void
}

const TaskDetailsDrawer = forwardRef<TaskDetailsDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (props: HandleOpenProps) => {
         setTaskId(props.taskId)
      },
      onClose: () => {
         setTaskId(null)
      },
   })
   const router = useRouter()
   const { message } = App.useApp()
   const scannerV2DrawerRef = useRef<ScannerV2DrawerRefType | null>(null)
   const control_qrCodeDisplayForRenewModal = useRef<QrCodeDisplayForRenewModalRefType | null>(null)

   const [taskId, setTaskId] = useState<string | null>(null)

   const qrCodeDisplayRef = useRef<QrCodeDisplayModalRefType | null>(null)

   const api_task = useQuery({
      queryKey: staff_qk.task.one_byId(taskId ?? ""),
      queryFn: () => Staff_Task_OneById({ id: taskId ?? "" }),
      enabled: !!taskId,
   })

   const mutate_finishTask = staff_mutations.task.finish()

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
         console.error(error)
      },
      onSuccess: async () => {
         message.success({
            content: `Bắt đầu tác vụ.`,
         })
         await api_task.refetch()
      },
      onSettled: () => {
         message.destroy(`loading`)
      },
   })

   const spareParts = useMemo(() => {
      return api_task.data?.issues.flatMap((issue) => issue.issueSpareParts)
   }, [api_task.data?.issues])

   const isRenewTask = useMemo(() => {
      return api_task.data?.device_renew
   }, [api_task.data])

   const isRenewTask_andHasFetchedMachine = useMemo(() => {
      return !!isRenewTask && api_task.data?.confirmReceipt
   }, [isRenewTask, api_task.data?.confirmReceipt])

   function Footer() {
      if (!api_task.isSuccess) return

      if (isRenewTask !== null && isRenewTask_andHasFetchedMachine === false) {
         return (
            <Button
               type="primary"
               className="w-full"
               size="large"
               icon={<Package size={20} />}
               onClick={() => {
                  isRenewTask && control_qrCodeDisplayForRenewModal.current?.handleOpen(api_task.data.id, isRenewTask)
               }}
            >
               Lấy máy mới
            </Button>
         )
      }

      if (
         api_task.data.issues.every(
            (i) => !!i.returnSparePartsStaffSignature && !!i.returnSparePartsStockkeeperSignature,
         )
      ) {
         return (
            <div>
               <AlertCard text="Tác vụ không tiếp tục được. Vui lòng đóng tác vụ" className="mb-2" type="info" />
               <Button
                  type="primary"
                  className="w-full"
                  size="large"
                  icon={<CloseOutlined size={20} />}
                  onClick={() => {
                     mutate_finishTask.mutate(
                        {
                           id: api_task.data.id,
                           payload: {
                              fixerNote: "",
                              imagesVerify: [],
                              videosVerify: "",
                           },
                        },
                        {
                           onSuccess: () => {
                              handleClose()
                              props.refetchFn?.()
                           },
                        },
                     )
                  }}
               >
                  Đóng tác vụ
               </Button>
            </div>
         )
      }

      if (spareParts && spareParts.length > 0 && !api_task.data.confirmReceipt) {
         return (
            <Button
               type="primary"
               className="w-full"
               size="large"
               icon={<Package size={20} />}
               onClick={() => {
                  qrCodeDisplayRef.current?.handleOpen(api_task.data.id, spareParts)
               }}
            >
               Lấy linh kiện
            </Button>
         )
      }

      if (api_task.data.status === TaskStatus.ASSIGNED) {
         return (
            <Button
               type="primary"
               className="w-full"
               size="large"
               icon={<Wrench size={20} />}
               onClick={() => {
                  const warrantyIssue = api_task.data.issues.find(
                     (issue) => issue.typeError.id === ReceiveWarrantyTypeErrorId,
                  )
                  if (!!warrantyIssue) {
                     router.push(`/staff/tasks/${api_task.data.id}/start`)
                  } else {
                     scannerV2DrawerRef.current?.handleOpen()
                  }
               }}
            >
               Bắt đầu tác vụ
            </Button>
         )
      }

      if (api_task.data.status === TaskStatus.IN_PROGRESS) {
         return (
            <Button
               type="primary"
               className="w-full"
               size="large"
               icon={<Wrench size={20} />}
               onClick={() => router.push(`/staff/tasks/${api_task.data.id}/start`)}
            >
               Tiếp tục tác vụ
            </Button>
         )
      }

      return null
   }

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <>
         {props.children?.(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title={
               <div className="mb-layout flex justify-between">
                  <div>
                     <h1 className="text-lg font-semibold text-black">Thông tin tác vụ</h1>
                     <p className="text-sm font-medium text-neutral-500">{api_task.data?.name ?? "Đang tải..."}</p>
                     {api_task.isSuccess && (
                        <div className="mt-2">
                           <Tag color={TaskStatusTagMapper[api_task.data?.status ?? ""].colorInverse}>
                              {TaskStatusTagMapper[api_task.data?.status ?? ""].text}
                           </Tag>
                           {api_task.data.priority && (
                              <Tag color="red" className="m-0">
                                 Ưu tiên
                              </Tag>
                           )}
                        </div>
                     )}
                  </div>
                  <Button size="large" type="text" icon={<CloseOutlined />} onClick={handleClose}></Button>
               </div>
            }
            classNames={{ header: "border-none pb-0", body: "pt-0", footer: "p-layout" }}
            closeIcon={null}
            placement="right"
            width="100%"
            footer={<Footer />}
         >
            {api_task.isPending && (
               <div className="grid h-full place-items-center">
                  <Spin />
               </div>
            )}
            {api_task.isError && (
               <div className="grid place-items-center">
                  <Result title="Có lỗi xảy ra" subTitle="Vui lòng thử lại sau" />
               </div>
            )}
            {api_task.isSuccess && (
               <>
                  {spareParts && !api_task.data.confirmReceipt && spareParts.length > 0 && (
                     <AlertCard
                        text="Tác vụ này có linh kiện. Vui lòng lấy các linh kiện ở kho."
                        className="mt-layout"
                     />
                  )}
                  {isRenewTask && !isRenewTask_andHasFetchedMachine && (
                     <AlertCard text="Vui lòng lấy máy mới ở kho" className="mt-layout" />
                  )}
                  <Divider className="mb-layout mt-0" />
                  <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
                     <section className="grid grid-cols-2 gap-4">
                        <div>
                           <h5 className="font-medium text-gray-500">Ngày sửa</h5>
                           <p className="mt-1 font-bold">
                              {dayjs(api_task.data.fixerDate).add(7, "hours").format("DD-MM-YYYY")}
                           </p>
                        </div>
                        <div>
                           <h5 className="font-medium text-gray-500">Thời gian thực hiện</h5>
                           <p className="mt-1">{api_task.data.totalTime} phút</p>
                        </div>
                        <div>
                           <h5 className="font-medium text-gray-500">Người sửa</h5>
                           <p className="mt-1">{api_task.data.fixer.username}</p>
                        </div>
                        {spareParts && spareParts.length > 0 && (
                           <div>
                              <h5 className="font-medium text-gray-500">Linh kiện</h5>
                              <p className="mt-1">{api_task.data.confirmReceipt ? "Đã lấy" : "Chưa lấy"}</p>
                           </div>
                        )}
                     </section>
                  </div>
                  <div className="mt-layout rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
                     <section>
                        <h4
                           className="mb-layout text-lg font-medium"
                           onClick={() =>
                              api_task.data && window.navigator.clipboard.writeText(api_task.data.device.id)
                           }
                        >
                           <Gear size={24} weight="duotone" className="mr-1 inline" />
                           Thông tin Thiết bị
                        </h4>
                        <Descriptions
                           contentStyle={{
                              display: "flex",
                              justifyContent: "flex-end",
                           }}
                           items={[
                              {
                                 label: "Mẫu máy",
                                 children: api_task.data.device.machineModel.name,
                              },
                              {
                                 label: "Nhà sản xuất",
                                 children: api_task.data.device.machineModel.manufacturer,
                              },
                              {
                                 label: "Khu vực",
                                 children: api_task.data.device.area.name,
                              },
                              {
                                 label: "Vị trí",
                                 children: (
                                    <span>
                                       {api_task.data.device?.positionX ?? api_task.data.device_renew?.positionX ?? "-"}{" "}
                                       x{" "}
                                       {api_task.data.device?.positionY ?? api_task.data.device_renew?.positionY ?? "-"}
                                    </span>
                                 ),
                              },
                           ]}
                        />
                        {/*<div className="flex flex-col gap-2">*/}
                        {/*   <div*/}
                        {/*      className="flex items-start justify-between"*/}
                        {/*   >*/}
                        {/*      <h5 className="font-medium text-gray-500">Tên thiết bị</h5>*/}
                        {/*      <p className="mt-1">{api_task.data.device.machineModel.name}</p>*/}
                        {/*   </div>*/}
                        {/*   <div className="flex items-start justify-between">*/}
                        {/*      <h5 className="font-medium text-gray-500">Nhà sản xuất</h5>*/}
                        {/*      <p className="mt-1">{api_task.data.device.machineModel.manufacturer}</p>*/}
                        {/*   </div>*/}
                        {/*   <div className="flex items-start justify-between">*/}
                        {/*      <h5 className="font-medium text-gray-500">Khu vực</h5>*/}
                        {/*      <p className="mt-1 font-bold">{api_task.data.device.area.name}</p>*/}
                        {/*   </div>*/}
                        {/*   <div className="flex items-start justify-between">*/}
                        {/*      <h5 className="font-medium text-gray-500">Vị trí</h5>*/}
                        {/*      <p className="mt-1 font-bold">*/}
                        {/*         {api_task.data.device?.positionX ?? api_task.data.device_renew?.positionX ?? "-"} x{" "}*/}
                        {/*         {api_task.data.device?.positionY ?? api_task.data.device_renew?.positionY ?? "-"}*/}
                        {/*      </p>*/}
                        {/*   </div>*/}
                        {/*</div>*/}
                     </section>
                  </div>
                  {spareParts && spareParts.length > 0 && (
                     <>
                        <Divider className="my-layout" />
                        <section className="mb-20">
                           <h4 className="mb-layout text-lg font-medium">
                              <Wrench size={24} weight="duotone" className="mr-1 inline" />
                              Linh kiện
                           </h4>
                           <div className="h-max max-h-44 overflow-auto rounded-md border-2 border-neutral-100 bg-neutral-50 p-2 pb-4">
                              {spareParts?.map((issueSparePart, index) => (
                                 <div key={issueSparePart.id} className="flex items-center justify-between">
                                    <span>
                                       {index + 1}. {issueSparePart.sparePart.name}
                                    </span>
                                    <span>x{issueSparePart.quantity}</span>
                                 </div>
                              ))}
                              {spareParts?.length === 0 && (
                                 <div className="grid h-full place-items-center">
                                    <Empty description="Không có linh kiện" />
                                 </div>
                              )}
                           </div>
                        </section>
                     </>
                  )}
                  {isRenewTask && (
                     <>
                        <Divider className="my-layout" />
                        <section className="mb-20">
                           <h4 className="mb-layout text-lg font-medium">
                              <Wrench size={24} weight="duotone" className="mr-1 inline" />
                              Thiết bị mới
                           </h4>
                           <div className="flex flex-col gap-2">
                              <div className="flex items-start justify-between">
                                 <h5 className="font-medium text-gray-500">Tên thiết bị</h5>
                                 <p className="mt-1">{isRenewTask.machineModel.name}</p>
                              </div>
                              <div className="flex items-start justify-between">
                                 <h5 className="font-medium text-gray-500">Nhà sản xuất</h5>
                                 <p className="mt-1">{isRenewTask.machineModel.manufacturer}</p>
                              </div>
                           </div>
                        </section>
                     </>
                  )}
               </>
            )}
         </Drawer>
         <GetSparePartsDrawer
            title="Lấy linh kiện"
            description="Hãy xuống kho và đưa mã QR sau cho chủ kho."
            refetch={() => {
               api_task.refetch()
            }}
            ref={qrCodeDisplayRef}
            onComplete={() => handleClose()}
         />
         <ScannerV2Drawer
            alertText="Vui lòng quét mã QR trên thiết bị để bắt đầu tác vụ."
            onScan={(result) => {
               if (result !== api_task.data?.device.id) {
                  message.error({
                     content: "Mã QR không đúng. Vui lòng thử lại.",
                  })
                  return
               }
               mutate_startTask.mutate(
                  {
                     id: api_task.data.id,
                  },
                  {
                     onSuccess: () => {
                        router.push(`/staff/tasks/${api_task.data?.id}/start`)
                     },
                  },
               )
            }}
            ref={scannerV2DrawerRef}
         />
         <QrCodeDisplayForRenewModal
            title="Lấy thiết bị mới"
            description="Hãy xuống kho và đưa mã QR sau cho chủ kho."
            refetch={api_task.refetch}
            ref={control_qrCodeDisplayForRenewModal}
            onComplete={() => handleClose()}
         />
      </>
   )
})

export default TaskDetailsDrawer
