import { Input, Modal, ModalProps, Select } from "antd"
import Form from "antd/es/form"
import { useEffect } from "react"
import stockkeeper_mutations from "@/features/stockkeeper/mutations"
import AlertCard from "@/components/AlertCard"

type FieldType = {
   reason: string
   description: string
}

type SparePart_CannotExportModalProps = {
   defaultReason?: string
   defaultDescription?: string
   issueId?: string
   handleSubmit?: (values: FieldType, issueId: string) => void
}
type Props = Omit<ModalProps, "children"> &
   SparePart_CannotExportModalProps & {
      handleClose?: () => void
   }

function SparePart_CannotExportModal(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const reason = Form.useWatch("reason", form)

   useEffect(() => {
      form.setFieldsValue({
         reason: props.defaultReason,
         description: props.defaultDescription,
      })
   }, [props.defaultDescription, props.defaultReason])

   useEffect(() => {
      if (!props.open) {
         form.resetFields()
      }
   }, [form, props.open])

   return (
      <Modal
         title="Hủy lỗi"
         centered
         classNames={{
            footer: "mt-3",
         }}
         onOk={() => form.submit()}
         {...props}
      >
         <AlertCard text="Vui lòng chọn lý do hủy lỗi" type="info" className="mb-4" />
         <Form<FieldType>
            form={form}
            layout="vertical"
            onFinish={(values) => {
               props.issueId && props.handleSubmit?.(values, props.issueId)
            }}
         >
            <Form.Item<FieldType> name="reason" label="Lý do" rules={[{ required: true }]}>
               <Select
                  placeholder="Chọn lý do"
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
