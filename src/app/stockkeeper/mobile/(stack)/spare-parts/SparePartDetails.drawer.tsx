import { SparePartDto } from "@/common/dto/SparePart.dto"
import useModalControls from "@/common/hooks/useModalControls"
import { MinusOutlined, PlusOutlined } from "@ant-design/icons"
import { CalendarCheck, Eye, IdentificationCard, Warehouse, WashingMachine } from "@phosphor-icons/react"
import { App, Button, Drawer, DrawerProps, InputNumber } from "antd"
import dayjs from "dayjs"
import { forwardRef, ReactNode, useImperativeHandle, useRef, useState } from "react"
import UpdateSparePartQuantityModal, { UpdateSparePartQuantityModalRefType } from "./UpdateSparePartQuantity.modal"
import { useMutation } from "@tanstack/react-query"
import Stockkeeper_SparePart_Update from "@/app/stockkeeper/_api/spare-part/update-spare-part-by-id.api"
import AlertCard from "@/components/AlertCard"
import { TaskDto } from "@/common/dto/Task.dto"
import { useRouter } from "next/navigation"
import { cn } from "@/common/util/cn.util"

type HandleOpen = {
   sparePart: SparePartDto
   specificUpdate?: {
      tasks: TaskDto[]
      quantityNeedToAdd: number
   }
}

export type SparePartDetailsDrawerRefType = {
   handleOpen: (props: HandleOpen) => void
}

type Props = {
   children?: (handleOpen: (props: HandleOpen) => void) => ReactNode
   drawerProps?: Omit<DrawerProps, "children">
   refetchFn?: () => void
}

const SparePartDetailsDrawer = forwardRef<SparePartDetailsDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (props: HandleOpen) => {
         setSparePart(props.sparePart)
         setControl_quantity(props.sparePart.quantity)
         setIsUpdating(false)
         setSpecificUpdate(props.specificUpdate)
      },
      onClose: () => {
         setTimeout(() => {
            setSparePart(null)
            setControl_quantity(0)
            setIsUpdating(false)
            setSpecificUpdate(undefined)
         }, 250)
      },
   })
   const { message } = App.useApp()
   const router = useRouter()

   const mutate_updateSparePart = useMutation({
      mutationFn: Stockkeeper_SparePart_Update,
      onError: (error) => {
         console.error(error)
         message.error("Cập nhật số lượng thất bại")
      },
      onSuccess: (data) => {
         message.success("Cập nhật số lượng thành công")
      },
      onMutate: () => {
         message.loading({
            content: "Đang cập nhật số lượng...",
            key: "update-spare-part",
         })
      },
      onSettled: () => {
         message.destroy("update-spare-part")
      },
   })

   const updateSparePartQuantityModalRef = useRef<UpdateSparePartQuantityModalRefType | null>(null)

   const [sparePart, setSparePart] = useState<SparePartDto | null>(null)
   const [isUpdating, setIsUpdating] = useState(false)
   const [control_quantity, setControl_quantity] = useState<number>(0)
   const [specificUpdate, setSpecificUpdate] = useState<HandleOpen["specificUpdate"] | undefined>(undefined)

   function handleUpdateQuantity() {
      if (!sparePart) return

      mutate_updateSparePart.mutate(
         {
            id: sparePart.id,
            payload: {
               quantity: control_quantity,
            },
         },
         {
            onSuccess: () => {
               props.refetchFn?.()
               handleClose()
            },
            onError: () => {
               props.refetchFn?.()
            },
         },
      )
   }

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <>
         {props.children?.(handleOpen)}
         <Drawer
            title="Chi tiết linh kiện"
            open={open}
            onClose={handleClose}
            placement="right"
            width="80%"
            loading={!!sparePart === false}
            classNames={{
               footer: "p-layout",
            }}
            footer={
               isUpdating ? (
                  <div>
                     <section className="mb-6">
                        <div className="mb-2 flex justify-between">
                           <h3
                              className={cn(
                                 "text-sm text-neutral-700 transition-all",
                                 specificUpdate &&
                                    sparePart &&
                                    specificUpdate.quantityNeedToAdd + sparePart.quantity > control_quantity &&
                                    "text-yellow-500",
                              )}
                           >
                              Số lượng cập nhật
                           </h3>
                           {/* {specificUpdate && (
                              <a
                                 className="text-sm"
                                 onClick={() =>
                                    setControl_quantity(specificUpdate.quantityNeedToAdd + (sparePart?.quantity || 0))
                                 }
                              >
                                 Cần thêm {specificUpdate.quantityNeedToAdd}
                              </a>
                           )} */}
                        </div>
                        <div className="flex gap-1">
                           <Button
                              type="primary"
                              icon={<MinusOutlined />}
                              disabled={control_quantity === 0}
                              onClick={() => setControl_quantity((prev) => (prev - 1 >= 0 ? prev - 1 : prev))}
                           />
                           <InputNumber
                              type="number"
                              inputMode="numeric"
                              className="flex-grow"
                              value={control_quantity}
                              status={
                                 specificUpdate &&
                                 sparePart &&
                                 specificUpdate.quantityNeedToAdd + sparePart.quantity > control_quantity
                                    ? "warning"
                                    : undefined
                              }
                              max={9999}
                              onChange={(e) => {
                                 if (!e || e < 0) {
                                    setControl_quantity(0)
                                    return
                                 }

                                 if (e > 9999) {
                                    setControl_quantity(9999)
                                    return
                                 }

                                 setControl_quantity(e)
                              }}
                           />
                           <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => setControl_quantity((prev) => (prev >= 9999 ? prev : prev + 1))}
                           />
                        </div>
                     </section>
                     <section className="flex gap-2">
                        <Button
                           type="default"
                           size="middle"
                           onClick={() => {
                              setIsUpdating(false)
                              setControl_quantity(sparePart?.quantity || 0)
                           }}
                        >
                           Hủy
                        </Button>
                        <Button type="primary" size="middle" className="w-full" onClick={handleUpdateQuantity}>
                           Cập nhật
                        </Button>
                     </section>
                  </div>
               ) : (
                  <Button type="primary" size="middle" className="w-full" onClick={() => setIsUpdating(true)}>
                     Cập nhật số lượng
                  </Button>
               )
            }
            {...props.drawerProps}
         >
            {specificUpdate && (
               <AlertCard
                  text={
                     <>
                        Có {specificUpdate.tasks.length} tác vụ đang chờ và{" "}
                        <strong>cần thêm {specificUpdate.quantityNeedToAdd} linh kiện</strong> này
                     </>
                  }
                  className="mb-layout"
               />
            )}
            <section className="grid grid-cols-1 gap-4">
               <div>
                  <h5 className="font-medium text-gray-500">Tên linh kiện</h5>
                  <p className="mt-1 flex items-center gap-2">
                     <IdentificationCard weight="duotone" size={18} />
                     {sparePart?.name}
                  </p>
               </div>
               <div>
                  <h5 className="font-medium text-gray-500">Số lượng trong kho</h5>
                  <div className="mt-1 flex items-center justify-between">
                     <p className="flex items-center gap-2">
                        <Warehouse size={18} weight="duotone" />
                        {sparePart?.quantity}
                     </p>
                     {specificUpdate && (
                        <div className="text-sm text-neutral-700">
                           Cần thêm <strong>+{specificUpdate.quantityNeedToAdd}</strong>
                        </div>
                     )}
                  </div>
               </div>
               <div>
                  <h5 className="font-medium text-gray-500">Ngày hết hạn</h5>
                  <p className="mt-1 flex items-center gap-2">
                     <CalendarCheck size={18} weight="duotone" />
                     {sparePart?.expirationDate ? dayjs(sparePart.expirationDate).format("DD/MM/YYYY") : "Không có"}
                  </p>
               </div>
               <div>
                  <h5 className="font-medium text-gray-500">Thiết bị hỗ trợ</h5>
                  <p className="mt-1 flex items-center gap-2">
                     <WashingMachine size={18} weight="duotone" />
                     {sparePart?.machineModel.name}
                  </p>
               </div>
            </section>
            {specificUpdate && (
               <section className="mt-layout">
                  <h3 className="mb-1 font-medium text-gray-500">Tác vụ liên quan</h3>
                  <div className="flex flex-col gap-2 text-sm">
                     {specificUpdate.tasks.map((task) => (
                        <div
                           key={task.id}
                           className="flex justify-between"
                           onClick={() => router.push(`/stockkeeper/mobile/tasks/${task.id}`)}
                        >
                           <h5>{task.name}</h5>
                           <a className="text-primary-500">
                              <Eye />
                           </a>
                        </div>
                     ))}
                  </div>
               </section>
            )}
         </Drawer>
         <UpdateSparePartQuantityModal ref={updateSparePartQuantityModalRef} />
      </>
   )
})

export default SparePartDetailsDrawer
