import WarrantyFailedReasons from "@/lib/constants/WarrantyFailedReasons"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { Form, Input, Modal, ModalProps, Select } from "antd"
import { SendOutlined } from "@ant-design/icons"
import staff_mutations from "@/features/staff/mutations"
import { useEffect, useState } from "react"
import ImageUploader from "@/components/ImageUploader"

type FieldType = {
   selectedReason: string
   note: string
}

type Issue_WarrantyFailedModalProps = {
   issueDto?: IssueDto
   taskId?: string
   onSuccess?: () => void
}
type Props = Omit<ModalProps, "children"> & Issue_WarrantyFailedModalProps

function Issue_WarrantyFailedModal(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const selectedReason = Form.useWatch<FieldType["selectedReason"]>("selectedReason", form)

   const [images, setImages] = useState<string[]>([])

   const mutate_failIssue = staff_mutations.issues.failedWarranty()

   function handleSubmit(values: FieldType, issueId: string, taskId: string) {
      mutate_failIssue.mutate(
         {
            id: issueId,
            payload: {
               imagesVerify: images,
               failReason: values.selectedReason + (values.note ? `: ${values.note}` : ""),
               taskId,
            },
         },
         {
            onSuccess: props.onSuccess,
         },
      )
   }

   useEffect(() => {
      if (!props.open) {
         form.resetFields()
      }
   }, [props.open])

   return (
      <Modal
         title="Đơn hủy bước"
         loading={!props.issueDto}
         centered
         okText="Gửi"
         okButtonProps={{
            icon: <SendOutlined />,
            iconPosition: "end",
         }}
         onOk={form.submit}
         cancelText="Đóng"
         {...props}
      >
         {props.issueDto && (
            <Form<FieldType>
               form={form}
               onFinish={(values) =>
                  props.issueDto && props.taskId && handleSubmit(values, props.issueDto.id, props.taskId)
               }
               className="mb-2"
            >
               <section>
                  <header className="mb-2">
                     <h2 className="text-base font-medium">Lý do hủy</h2>
                     <p className="font-base text-sm text-neutral-500">
                        Vui lòng chọn lý do không hoàn thành được bước
                     </p>
                  </header>
                  <Form.Item<FieldType> name="selectedReason" rules={[{ required: true }]}>
                     <Select
                        options={WarrantyFailedReasons[props.issueDto.typeError.id]}
                        placeholder="Chọn lý do hủy"
                        autoFocus
                     />
                  </Form.Item>
               </section>
               <section>
                  <header className="mb-2">
                     <h2 className="text-base font-medium">Ghi chú thêm</h2>
                  </header>
                  <Form.Item<FieldType> name="note" rules={[{ required: selectedReason === "Khác" }]}>
                     <Input.TextArea rows={3} maxLength={300} showCount placeholder="Nhập ghi chú" />
                  </Form.Item>
               </section>
               <section className="mt-layout">
                  <header className="mb-2">
                     <h2 className="text-base font-medium">Hình ảnh đính kèm</h2>
                     <p className="font-base text-sm text-neutral-500">Vui lòng tải hình ảnh đính kèm (nếu có)</p>
                  </header>
                  <ImageUploader imageUris={images} setImageUris={setImages} />
               </section>
            </Form>
         )}
      </Modal>
   )
}

export default Issue_WarrantyFailedModal
export type { Issue_WarrantyFailedModalProps }
