import { Input, Modal, ModalProps } from "antd"
import Form from "antd/es/form"
import stockkeeper_mutations from "@/features/stockkeeper/mutations"

type FieldType = {
   reason: string
}

type ExportWarehouse_DelayModalProps = {
   id?: string
   refetchFn?: () => void
   onSuccess?: () => void
}
type Props = Omit<ModalProps, "children"> &
   ExportWarehouse_DelayModalProps & {
      handleClose?: () => void
   }

function ExportWarehouse_DelayModal(props: Props) {
   const [form] = Form.useForm<FieldType>()

   const mutate_delay = stockkeeper_mutations.exportWarehouse.delay()

   function handleSubmit(values: FieldType, id: string) {
      mutate_delay.mutate(
         {
            id,
            payload: {
               reason_delay: values.reason,
            },
         },
         {
            onSuccess: () => {
               props.handleClose?.()
               props.refetchFn?.()
               props.onSuccess?.()
            },
         },
      )
   }

   return (
      <Modal title={"Trì hoãn đơn xuất"} onOk={form.submit} centered {...props}>
         <Form<FieldType> form={form} onFinish={(values) => props.id && handleSubmit(values, props.id)}>
            <Form.Item<FieldType> label={"Lý do trì hoãn"} name={"reason"} rules={[{ required: true }]}>
               <Input.TextArea
                  rows={3}
                  maxLength={300}
                  showCount
                  placeholder={"Vui lòng ghi lý do trì hoãn đơn xuất này"}
               />
            </Form.Item>
         </Form>
      </Modal>
   )
}

export default ExportWarehouse_DelayModal
export type { ExportWarehouse_DelayModalProps }
