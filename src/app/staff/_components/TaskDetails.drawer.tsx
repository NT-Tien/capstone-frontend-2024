import useModalControls from "@/common/hooks/useModalControls"
import { Button, Divider, Drawer, Empty, Result, Spin, Tag } from "antd"
import { forwardRef, ReactNode, useImperativeHandle, useMemo, useState } from "react"
import { LeftOutlined, CloseOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import staff_qk from "../_api/qk"
import Staff_Task_OneById from "../_api/task/one-byId.api"
import dayjs from "dayjs"
import { TaskStatus, TaskStatusTagMapper } from "@/common/enum/task-status.enum"
import { Gear, Package, Wrench } from "@phosphor-icons/react"
import AlertCard from "@/components/AlertCard"

type HandleOpenProps = {
   taskId: string
}

export type TaskDetailsDrawerRefType = {
   handleOpen: (props: HandleOpenProps) => void
}

type Props = {
   children?: (handleOpen: (props: HandleOpenProps) => void) => ReactNode
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

   const [taskId, setTaskId] = useState<string | null>(null)

   const api_task = useQuery({
      queryKey: staff_qk.task.one_byId(taskId ?? ""),
      queryFn: () => Staff_Task_OneById({ id: taskId ?? "" }),
      enabled: !!taskId,
   })

   const spareParts = useMemo(() => {
      return api_task.data?.issues.flatMap((issue) => issue.issueSpareParts)
   }, [api_task.data?.issues])

   function Footer() {
      if (!api_task.isSuccess) return

      if (spareParts && spareParts.length > 0 && !api_task.data.confirmReceipt) {
         return (
            <Button type="primary" className="w-full" size="large" icon={<Package size={20} />}>
               Lấy linh kiện
            </Button>
         )
      }

      if (api_task.data.status === TaskStatus.ASSIGNED) {
         return (
            <Button type="primary" className="w-full" size="large" icon={<Wrench size={20} />}>
               Hoàn thành tác vụ
            </Button>
         )
      }

      if (api_task.data.status === TaskStatus.IN_PROGRESS) {
         return (
            <Button type="primary" className="w-full" size="large" icon={<Wrench size={20} />}>
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
            classNames={{ header: "border-none pb-0", body: "pt-0" }}
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
                  <AlertCard text="Tác vụ này có linh kiện. Vui lòng lấy các linh kiện ở kho." className="mt-layout" />
                  <Divider className="mb-layout mt-0" />
                  <section className="grid grid-cols-2 gap-4">
                     <div>
                        <h5 className="font-medium text-gray-500">Ngày sửa</h5>
                        <p className="mt-1">{dayjs(api_task.data.fixerDate).add(7, "hours").format("DD-MM-YYYY")}</p>
                     </div>
                     <div>
                        <h5 className="font-medium text-gray-500">Thời gian thực hiện</h5>
                        <p className="mt-1">{api_task.data.totalTime} phút</p>
                     </div>
                     <div>
                        <h5 className="font-medium text-gray-500">Người sửa</h5>
                        <p className="mt-1">{api_task.data.fixer.username}</p>
                     </div>
                  </section>
                  <Divider className="my-layout" />
                  <section>
                     <h4 className="mb-layout text-lg font-medium">
                        <Gear size={24} weight="duotone" className="mr-1 inline" />
                        Thông tin Thiết bị
                     </h4>
                     <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                           <h5 className="font-medium text-gray-500">Tên thiết bị</h5>
                           <p className="mt-1">{api_task.data.device.machineModel.name}</p>
                        </div>
                        <div className="flex items-start justify-between">
                           <h5 className="font-medium text-gray-500">Nhà sản xuất</h5>
                           <p className="mt-1">{api_task.data.device.machineModel.manufacturer}</p>
                        </div>
                        <div className="flex items-start justify-between">
                           <h5 className="font-medium text-gray-500">Khu vực</h5>
                           <p className="mt-1">{api_task.data.device.area.name}</p>
                        </div>
                        <div className="flex items-start justify-between">
                           <h5 className="font-medium text-gray-500">Vị trí</h5>
                           <p className="mt-1">
                              {api_task.data.device.positionX} x {api_task.data.device.positionY}
                           </p>
                        </div>
                     </div>
                  </section>
                  <Divider className="my-layout" />
                  <section className="mb-20">
                     <h4 className="mb-layout text-lg font-medium">
                        <Wrench size={24} weight="duotone" className="mr-1 inline" />
                        Linh kiện
                     </h4>
                     <div className="h-44 overflow-auto rounded-md border-2 border-neutral-100 bg-neutral-50 p-2">
                        {spareParts?.map((issueSparePart, index) => (
                           <div key={issueSparePart.id}>
                              {index + 1}. {issueSparePart.sparePart.name} (x{issueSparePart.quantity})
                           </div>
                        ))}
                        {spareParts?.length === 0 && (
                           <div className="grid h-full place-items-center">
                              <Empty description="Không có linh kiện" />
                           </div>
                        )}
                     </div>
                  </section>
                  <div className="fixed bottom-0 left-0 w-full border-t-2 border-t-neutral-100 bg-white p-layout"></div>
               </>
            )}
         </Drawer>
      </>
   )
})

export default TaskDetailsDrawer
