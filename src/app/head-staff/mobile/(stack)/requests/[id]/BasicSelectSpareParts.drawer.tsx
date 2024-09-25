"use client"

import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import useModalControls from "@/lib/hooks/useModalControls"
import { cn } from "@/lib/utils/cn.util"
import AlertCard from "@/components/AlertCard"
import { DeleteOutlined, MinusOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Divider, Drawer, InputNumber } from "antd"
import { forwardRef, ReactNode, useImperativeHandle, useState } from "react"

type HandleOpen = {
   sparePart: SparePartDto
   defaultQuantity?: number
   isUpdate?: boolean
}

export type BasicSelectSparePartDrawerRefType = {
   handleOpen: (props: HandleOpen) => void
}

type Props = {
   children?: (handleOpen: (props: HandleOpen) => void) => ReactNode
   onOk: (sparePart: SparePartDto, quantity: number) => void
   afterClose?: () => void
}

const BasicSelectSparePartDrawer = forwardRef<BasicSelectSparePartDrawerRefType, Props>(function Component(props, ref) {
   const [sparePart, setSparePart] = useState<SparePartDto | undefined>()
   const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
   const [isUpdate, setIsUpdate] = useState<boolean>(false)

   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (props: HandleOpen) => {
         setSparePart(props.sparePart)
         setSelectedQuantity(props.defaultQuantity ?? 1)
         setIsUpdate(props.isUpdate ?? false)
      },
      onClose: () => {
         setSparePart(undefined)
         setSelectedQuantity(1)
         props.afterClose?.()
         setIsUpdate(false)
      },
   })

   function Footer() {
      return [
         <div key="submit">
            {sparePart && selectedQuantity > sparePart.quantity && (
               <AlertCard
                  className="mb-layout-half"
                  text="Số lượng linh kiện bạn đã chọn vượt quá số lượng hiện có trong kho."
               />
            )}
            <Button
               key="submit"
               size="large"
               icon={<SaveOutlined />}
               danger={selectedQuantity <= 0}
               type="primary"
               className={cn("w-full", sparePart && selectedQuantity > sparePart.quantity && "bg-yellow-500")}
               disabled={isUpdate === false && selectedQuantity <= 0}
               onClick={() => {
                  if (sparePart) {
                     props.onOk(sparePart, selectedQuantity)
                     handleClose()
                  }
               }}
            >
               {isUpdate ? "Xóa linh kiện" : "Lưu linh kiện"}
            </Button>
         </div>,
      ]
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
            title="Chọn linh kiện"
            placement="bottom"
            height="max-content"
            classNames={{
               footer: "p-layout",
            }}
            footer={<Footer />}
         >
            <div className="flex flex-col gap-2">
               <div className="flex items-start justify-between">
                  <h5 className="font-medium text-gray-500">Tên linh kiện</h5>
                  <p className="mt-1">{sparePart?.name}</p>
               </div>
               <div className="flex items-start justify-between">
                  <h5 className="font-medium text-gray-500">Số lượng trong kho</h5>
                  <p className="mt-1">{sparePart?.quantity}</p>
               </div>
            </div>
            {sparePart && (
               <>
                  <Divider className="my-4" />
                  <section className="grid w-full place-content-center">
                     <h3 className="mb-2 text-center font-medium text-neutral-500">Chọn số lượng</h3>
                     <div className="flex w-full items-center gap-2">
                        <Button
                           icon={<MinusOutlined />}
                           onClick={() => {
                              setSelectedQuantity((prev) => {
                                 if (prev - 1 <= 0) return 0
                                 return prev - 1
                              })
                           }}
                           size="large"
                        />
                        <InputNumber
                           value={selectedQuantity}
                           onChange={(e) => {
                              let num = e
                              if (num === null) num = 1

                              setSelectedQuantity(num)
                           }}
                           min={0}
                           size="large"
                           inputMode="numeric"
                        />
                        <Button
                           icon={<PlusOutlined />}
                           onClick={() => {
                              setSelectedQuantity((prev) => {
                                 return prev + 1
                              })
                           }}
                           size="large"
                        />
                     </div>
                  </section>
               </>
            )}
         </Drawer>
      </>
   )
})

export default BasicSelectSparePartDrawer
