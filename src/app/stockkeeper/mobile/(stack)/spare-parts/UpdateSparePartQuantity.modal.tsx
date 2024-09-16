import { SparePartDto } from "@/common/dto/SparePart.dto"
import useModalControls from "@/common/hooks/useModalControls"
import { Button, Input, InputNumber, Modal } from "antd"
import { forwardRef, ReactNode, useImperativeHandle, useState } from "react"
import { MinusOutlined, PlusOutlined } from "@ant-design/icons"

type HandleOpen = {
   sparePart: SparePartDto
}

export type UpdateSparePartQuantityModalRefType = {
   handleOpen: (props: HandleOpen) => void
}

type Props = {
   children?: (handleOpen: (props: HandleOpen) => void) => ReactNode
}

const UpdateSparePartQuantityModal = forwardRef<UpdateSparePartQuantityModalRefType, Props>(
   function Component(props, ref) {
      const { open, handleOpen, handleClose } = useModalControls({
         onOpen: (props: HandleOpen) => {
            setSparePart(props.sparePart)
            setQuantity(props.sparePart.quantity)
         },
         onClose: () => {
            setTimeout(() => {
               setSparePart(null)
               setQuantity(0)
            }, 250)
         },
      })

      useImperativeHandle(ref, () => ({
         handleOpen,
      }))

      const [sparePart, setSparePart] = useState<SparePartDto | null>(null)
      const [quantity, setQuantity] = useState<number>(0)

      return (
         <>
            {props.children?.(handleOpen)}
            <Modal title="Cập nhật số lượng" open={open} onCancel={handleClose} footer={<Button>Cập nhật</Button>} centered>
               <div className="flex gap-1">
                  <Button type="primary" icon={<MinusOutlined />}></Button>
                  <InputNumber value={quantity} onChange={(e) => e && setQuantity(e)} />
                  <Button type="primary" icon={<PlusOutlined />}></Button>
               </div>
            </Modal>
         </>
      )
   },
)

export default UpdateSparePartQuantityModal
