"use client"

import Stockkeeper_SparePart_Update from "@/features/stockkeeper/api/spare-part/update-spare-part-by-id.api"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { MinusOutlined, PlusOutlined } from "@ant-design/icons"
import { Warehouse } from "@phosphor-icons/react"
import { useMutation } from "@tanstack/react-query"
import { App, Button, Descriptions, Divider, InputNumber, Modal, ModalProps } from "antd"
import { useEffect, useState } from "react"

type UpdateQuantityModalProps = {
   sparePart?: SparePartDto
   needMore?: number
   refetchFn?: (sparePartId: string) => void
   min?: number
   isNormalUpdate?: boolean
}

type Props = ModalProps & UpdateQuantityModalProps

function UpdateQuantityModal(props: Props) {
   const { message } = App.useApp()

   const [quantity, setQuantity] = useState<number>(0)

   const mutate_updateQuantity = useMutation({
      mutationFn: Stockkeeper_SparePart_Update,
      onError: (error) => {
         message.error(error.message)
      },
      onSuccess: () => {
         message.success("Cập nhật số lượng thành công")
      },
      onMutate: () => {
         message.loading({
            content: "Đang cập nhật số lượng...",
            key: "updateQuantity",
         })
      },
      onSettled: () => {
         message.destroy("updateQuantity")
      },
   })

   function handleUpdateQuantity(sparePartId: string, quantity: number) {
      mutate_updateQuantity.mutate(
         {
            id: sparePartId,
            payload: {
               quantity,
            },
         },
         {
            onSuccess: () => {
               props.refetchFn?.(sparePartId)
            },
         },
      )
   }

   useEffect(() => {
      if (props.sparePart) {
         setQuantity(props.sparePart.quantity)
      }
   }, [props.sparePart])

   return (
      <Modal
         {...props}
         title="Cập nhật linh kiện"
         footer={
            <div className="flex">
               <div className="flex flex-grow gap-1">
                  <Button
                     type="primary"
                     icon={<MinusOutlined />}
                     onClick={() => {
                        if (quantity > 0) {
                           if (props.min && quantity <= props.min) return
                           setQuantity(quantity - 1)
                        }
                     }}
                     disabled={quantity <= 0 || (props.min ? quantity <= props.min : false)}
                  ></Button>
                  <InputNumber
                     value={quantity}
                     onChange={(e) => e && setQuantity(e)}
                     min={props.min}
                     max={props.needMore}
                  />
                  <Button
                     type="primary"
                     icon={<PlusOutlined />}
                     onClick={() => {
                        props.needMore
                           ? setQuantity(quantity < props.needMore ? quantity + 1 : quantity)
                           : setQuantity(quantity + 1)
                     }}
                     disabled={!!(props.needMore && quantity >= props.needMore)}
                  ></Button>
               </div>
               <div className="flex gap-1">
                  <Button type="default" onClick={props.onCancel}>
                     Hủy
                  </Button>
                  <Button
                     type="primary"
                     disabled={props.isNormalUpdate ? false : props.needMore !== quantity}
                     onClick={() => props.sparePart && handleUpdateQuantity(props.sparePart.id, quantity)}
                  >
                     Cập nhật
                  </Button>
               </div>
            </div>
         }
      >
         {props.sparePart && (
            <>
               <Descriptions
                  column={1}
                  items={[
                     {
                        label: "Tên linh kiện",
                        children: props.sparePart.name,
                     },
                     {
                        label: "Mẫu máy",
                        children: props.sparePart.machineModel?.name,
                        className: props.isNormalUpdate ? "hidden" : "",
                     },
                     {
                        label: "Số lượng trong kho",
                        children: (
                           <span className="flex items-center gap-1 text-red-500">
                              <Warehouse weight="fill" />
                              {props.sparePart.quantity}
                           </span>
                        ),
                     },
                     {
                        label: "Số lượng cần thêm",
                        children: <span className="text-green-500">+{props.needMore}</span>,
                        className: props.isNormalUpdate ? "hidden" : "",
                     },
                  ]}
                  className="mt-2"
                  colon={false}
                  contentStyle={{
                     display: "flex",
                     justifyContent: "end",
                  }}
               />
               <Divider className="" />
            </>
         )}
      </Modal>
   )
}

export default UpdateQuantityModal
export type { UpdateQuantityModalProps }
