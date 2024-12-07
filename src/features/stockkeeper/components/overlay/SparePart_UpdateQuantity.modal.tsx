import stockkeeper_mutations from "@/features/stockkeeper/mutations"
import { Form, InputNumber, Modal, ModalProps } from "antd"
import { useState } from "react"

type SparePart_UpdateQuantityModalProps = {
   max?: number
   sparePartId?: string
   onFinish?: () => void
}
type Props = Omit<ModalProps, "children"> &
   SparePart_UpdateQuantityModalProps & {
      handleClose?: () => void
   }

function SparePart_UpdateQuantityModal(props: Props) {
   const [value, setValue] = useState(0)

   const mutate_updateSparePartQuantity = stockkeeper_mutations.sparePart.addQuantity({})

   function handleFinish() {
      if (!props.sparePartId) return

      mutate_updateSparePartQuantity.mutate(
         {
            id: props.sparePartId,
            payload: {
               quantity: value,
            },
         },
         {
            onSuccess: () => {
               props.handleClose?.()
               props.onFinish?.()
            },
         },
      )
   }

   return (
      <Modal
         title="Cập nhật kho"
         okText="Cập nhật"
         okButtonProps={{
            disabled: value === 0,
         }}
         onOk={handleFinish}
         {...props}
      >
         <Form.Item label="Số lượng nhập kho">
            <InputNumber
               value={value}
               onChange={(e) => {
                  if (e) {
                     if (e < 0) setValue(0)
                     if (props.max && e > props.max) setValue(props.max)
                     else setValue(e)
                  } else {
                     setValue(0)
                  }
               }}
            />
         </Form.Item>
      </Modal>
   )
}

export default SparePart_UpdateQuantityModal
export type { SparePart_UpdateQuantityModalProps }
