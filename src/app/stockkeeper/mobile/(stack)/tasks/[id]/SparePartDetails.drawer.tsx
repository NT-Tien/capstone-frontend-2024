import Stockkeeper_SparePart_Update from "@/app/stockkeeper/_api/spare-part/update-spare-part-by-id.api"
import { FixRequestIssueSparePartDto } from "@/common/dto/FixRequestIssueSparePart.dto"
import useModalControls from "@/common/hooks/useModalControls"
import { LeftOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons"
import { useMutation } from "@tanstack/react-query"
import { App, Button, Divider, Drawer, InputNumber } from "antd"
import { forwardRef, ReactNode, useImperativeHandle, useState } from "react"

export type SparePartDetailsDrawerRefType = {
   handleOpen: (issueSparePart: FixRequestIssueSparePartDto) => void
}

type Props = {
   children?: (handleOpen: (issueSparePart: FixRequestIssueSparePartDto) => void) => ReactNode
   refetchFn?: () => void
}

const SparePartDetailsDrawer = forwardRef<SparePartDetailsDrawerRefType, Props>(function Component(props, ref) {
   const { message } = App.useApp()

   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (issueSparePart: FixRequestIssueSparePartDto) => {
         setIssueSparePart(issueSparePart)
         setQuantity(issueSparePart.sparePart.quantity)
      },
      onClose: () => {
         setIssueSparePart(undefined)
      },
   })
   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   const mutate_updateSparePart = useMutation({
      mutationFn: Stockkeeper_SparePart_Update,
      onMutate: () => {
         message.destroy("updateSparePart")
         message.loading({
            content: "Đang cập nhật...",
            key: "updateSparePart",
         })
      },
      onSettled: () => {
         message.destroy("updateSparePart")
      },
      onSuccess: () => {
         message.success({
            content: "Cập nhật thành công",
         })
      },
      onError: () => {
         message.error({
            content: "Cập nhật thất bại",
         })
      },
   })

   const [issueSparePart, setIssueSparePart] = useState<FixRequestIssueSparePartDto | undefined>()
   const [quantity, setQuantity] = useState<number | undefined>()

   function handleUpdate() {
      if (!issueSparePart || quantity === undefined) return

      mutate_updateSparePart.mutate(
         {
            id: issueSparePart?.sparePart.id,
            payload: {
               quantity: quantity,
            },
         },
         {
            onSuccess: () => {
               handleClose()
               props.refetchFn?.()
            },
         },
      )
   }

   return (
      <>
         {props.children?.(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title={<span className="text-lg text-neutral-800">Chi tiết linh kiện</span>}
            placement="bottom"
            height="max-content"
            closeIcon={<LeftOutlined />}
            className="bg-neutral-100"
            classNames={{
               header: "p-layout",
               body: "p-layout pb-28",
            }}
         >
            <section id="task-details" className="z-50 rounded-lg bg-white">
               <div className="flex items-center justify-between p-3">
                  <h2 className="text-base font-medium text-gray-800">Tên linh kiện</h2>
                  <span className="text-sm text-gray-500">{issueSparePart?.sparePart.name}</span>
               </div>
               <Divider className="my-0" />
               <div className="flex items-center justify-between p-3">
                  <h2 className="text-base font-medium text-gray-800">Số lượng trong kho</h2>
                  <span className="text-sm text-gray-500">{issueSparePart?.sparePart.quantity}</span>
               </div>
               <Divider className="my-0" />
               <div className="flex items-center justify-between p-3">
                  <h2 className="text-base font-medium text-gray-800">Số lượng còn thiếu</h2>
                  <span className="text-sm text-gray-500">
                     {issueSparePart ? (
                         issueSparePart?.quantity - issueSparePart?.sparePart.quantity > 0 ? `${issueSparePart?.quantity - issueSparePart?.sparePart.quantity}` : "Đủ"
                     ) : 0}
                  </span>
               </div>
               <div></div>
            </section>
            <section className="mt-8 grid place-items-center">
               <div className="flex items-center gap-1">
                  <Button
                     icon={<MinusOutlined />}
                     size="large"
                     onClick={() => {
                        setQuantity((prev) => (prev && prev > 0 ? prev - 1 : 0))
                     }}
                     type="primary"
                  />
                  <InputNumber
                     size="large"
                     type="number"
                     defaultValue={quantity}
                     value={quantity}
                     onChange={(e) => setQuantity(e ?? 0)}
                  />
                  <Button
                     icon={<PlusOutlined />}
                     size="large"
                     onClick={() => {
                        setQuantity((prev) => (prev || 0) + 1)
                     }}
                     type="primary"
                  />
               </div>
            </section>
            <section className="fixed bottom-0 left-0 flex w-full gap-3 bg-white p-layout">
               <Button
                  size="large"
                  type="primary"
                  className="w-full"
                  disabled={quantity === issueSparePart?.sparePart.quantity}
                  onClick={handleUpdate}
               >
                  Cập nhật
               </Button>
            </section>
         </Drawer>
      </>
   )
})

export default SparePartDetailsDrawer