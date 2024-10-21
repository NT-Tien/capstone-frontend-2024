import { Input, Modal, ModalProps, Select } from "antd"
import Form from "antd/es/form"
import { useEffect } from "react"
import stockkeeper_mutations from "@/features/stockkeeper/mutations"

type FieldType = {
   reason: string
   description: string
}

type SparePart_CannotExportModalProps = {
   taskId?: string
   onSuccess?: () => void
}
type Props = Omit<ModalProps, "children"> &
   SparePart_CannotExportModalProps & {
      handleClose?: () => void
   }

function SparePart_CannotExportModal(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const reason = Form.useWatch("reason", form)

   const mutate_cancelTask = stockkeeper_mutations.task.cancel()

   function handleSubmit(values: FieldType, taskId: string) {
      mutate_cancelTask.mutate(
         {
            id: taskId,
            payload: {
               reason: values.reason + (values.description ? `: ${values.description}` : ""),
            },
         },
         {
            onSuccess: () => {
               props.handleClose?.()
               props.onSuccess?.()
            },
         },
      )
   }

   useEffect(() => {
      if (!props.open) {
         form.resetFields()
      }
   }, [form, props.open])

   return (
      <Modal
         title="Hủy tác vụ"
         centered
         classNames={{
            footer: "mt-3",
         }}
         onOk={() => form.submit()}
         {...props}
      >
         <Form<FieldType>
            form={form}
            layout="vertical"
            onFinish={(values) => {
               props.taskId && handleSubmit(values, props.taskId)
            }}
         >
            <Form.Item<FieldType> name="reason" label="Lý do hủy tác vụ" rules={[{ required: true }]}>
               <Select
                  placeholder="Chọn lý do hủy tác vụ"
                  options={[
                     {
                        label: "Linh kiện không tồn tại",
                        value: "Linh kiện không tồn tại",
                     },
                     {
                        label: "Linh kiện bị hỏng",
                        value: "Linh kiện bị hỏng",
                     },
                     {
                        label: "Linh kiện không đủ số lượng",
                        value: "Linh kiện không đủ số lượng",
                     },
                     {
                        label: "Khác",
                        value: "Khác",
                     },
                  ]}
               />
            </Form.Item>
            <Form.Item<FieldType>
               label="Mô tả thêm"
               name="description"
               className="mb-10"
               initialValue={""}
               rules={[
                  {
                     required: reason === "Khác",
                  },
               ]}
            >
               <Input.TextArea rows={3} maxLength={300} showCount placeholder="Mô tả thêm" />
            </Form.Item>
         </Form>
      </Modal>
   )
}

export default SparePart_CannotExportModal
export type { SparePart_CannotExportModalProps }
