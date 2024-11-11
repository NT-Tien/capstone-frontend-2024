"use client"

import WarrantyFailedReasons, {
   WarrantyFailedGenerator,
   WarrantyFailedReasonsList,
} from "@/lib/constants/WarrantyFailedReasons"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { App, Card, DatePicker, Divider, Form, Input, Modal, ModalProps, Select } from "antd"
import { SendOutlined } from "@ant-design/icons"
import staff_mutations from "@/features/staff/mutations"
import { useEffect, useState } from "react"
import ImageUploader from "@/components/ImageUploader"
import dayjs, { Dayjs } from "dayjs"
import staff_queries from "@/features/staff/queries"
import CustomDatePicker from "@/components/CustomDatePicker"

type FieldType = {
   selectedReason: string
   note: string
   newDate?: Dayjs
}

type Issue_WarrantyFailedModalProps = {
   issueDto?: IssueDto
   taskId?: string
   onSuccess?: (values: FieldType) => void
}
type Props = Omit<ModalProps, "children"> & Issue_WarrantyFailedModalProps

function Issue_WarrantyFailedModal(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()
   const selectedReason = Form.useWatch<FieldType["selectedReason"]>("selectedReason", form)

   const api_task = staff_queries.task.one(
      { id: props.taskId ?? "" },
      {
         enabled: !!props.taskId,
      },
   )

   const [images, setImages] = useState<string[]>([])

   const mutate_failIssue = staff_mutations.issues.failedWarranty()

   function handleSubmit(values: FieldType, issueId: string, taskId: string) {
      if (values.selectedReason === WarrantyFailedReasonsList.WARRANTY_REJECTED_AFTER_PROCESS && images.length === 0) {
         message.destroy("no-image")
         message.error({
            content: "Vui lòng tải biên nhận bảo hành",
            key: "no-image",
         })
         return
      }

      function generateFailReason() {
         switch (values.selectedReason) {
            case WarrantyFailedReasonsList.CHANGE_RECEIVE_DATE: {
               if (values.newDate) {
                  return WarrantyFailedGenerator[values.selectedReason].failReason(values.newDate, values.note)
               }
            }
            default: {
               return values.selectedReason + (values.note ? `: ${values.note}` : "")
            }
         }
      }

      mutate_failIssue.mutate(
         {
            id: issueId,
            payload: {
               imagesVerify: images,
               failReason: generateFailReason(),
               taskId,
               shouldSkipUpdateTask:
                  values.selectedReason === WarrantyFailedReasonsList.WARRANTY_REJECTED_AFTER_PROCESS,
            },
         },
         {
            onSuccess: () => props.onSuccess?.(values),
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
         title={
            <div>
               <h1>Hủy bước</h1>
               <p className="text-sm font-normal text-neutral-500">
                  Vui lòng điền thông tin phía dưới để hủy bước <strong>{props.issueDto?.typeError.name}</strong>
               </p>
            </div>
         }
         loading={!props.issueDto}
         centered
         okText="Gửi"
         okButtonProps={{
            icon: <SendOutlined />,
            iconPosition: "end",
            disabled: selectedReason === undefined,
            className: "px-10",
         }}
         onOk={form.submit}
         cancelText="Đóng"
         {...props}
      >
         <Divider className="my-4" />
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
                     <h2 className="text-base font-medium">Lý do không hoàn thành</h2>
                  </header>
                  <Form.Item<FieldType> name="selectedReason" rules={[{ required: true }]}>
                     <Select
                        options={WarrantyFailedReasons[props.issueDto.typeError.id]}
                        placeholder="Chọn lý do hủy"
                        autoFocus
                     />
                  </Form.Item>
               </section>
               {(selectedReason === WarrantyFailedReasonsList.OTHER ||
                  selectedReason === WarrantyFailedReasonsList.SERVICE_CENTER_CLOSED) && (
                  <>
                     <section>
                        <header className="mb-2">
                           <h2 className="text-base font-medium">Ghi chú thêm</h2>
                        </header>
                        <Form.Item<FieldType> name="note" rules={[{ required: true }]}>
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
                  </>
               )}
               {selectedReason === WarrantyFailedReasonsList.WARRANTY_REJECTED_ON_ARRIVAL && (
                  <>
                     <section>
                        <header className="mb-2">
                           <h2 className="text-base font-medium">Lý do từ chối bảo hành</h2>
                        </header>
                        <Form.Item<FieldType> name="note" rules={[{ required: true }]}>
                           <Input.TextArea rows={3} maxLength={300} showCount placeholder="Nhập lý do" />
                        </Form.Item>
                     </section>
                     <section className="mt-layout">
                        <header className="mb-2">
                           <h2 className="text-base font-medium">Hình ảnh đính kèm</h2>
                           <p className="font-base text-sm text-neutral-500">Vui lòng tải hình ảnh đính kèm (nếu có)</p>
                        </header>
                        <ImageUploader imageUris={images} setImageUris={setImages} />
                     </section>
                  </>
               )}
               {selectedReason === WarrantyFailedReasonsList.CHANGE_RECEIVE_DATE && (
                  <>
                     {api_task.isSuccess ? (
                        <section>
                           <header className="mb-2">
                              <h2 className="text-base font-medium">Thời gian nhận máy</h2>
                              <p className="font-base text-sm text-neutral-500">
                                 Vui lòng nhập thời gian nhận máy đã bảo hành
                              </p>
                           </header>
                           <Form.Item<FieldType> name="newDate" rules={[{ required: true }]}>
                              <CustomDatePicker
                                 bounds={{
                                    min: dayjs(api_task.data.fixerDate).add(1, "day"),
                                    max: dayjs().add(1, "years"),
                                 }}
                              />
                           </Form.Item>
                        </section>
                     ) : (
                        <>{api_task.isPending && <Card loading />}</>
                     )}
                     <section>
                        <header className="mb-2">
                           <h2 className="text-base font-medium">Ghi chú</h2>
                        </header>
                        <Form.Item<FieldType> name="note" rules={[{ required: true }]}>
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
                  </>
               )}
               {selectedReason === WarrantyFailedReasonsList.WARRANTY_REJECTED_AFTER_PROCESS && (
                  <>
                     <section>
                        <header className="mb-2">
                           <h2 className="text-base font-medium">Lý do không bảo hành</h2>
                        </header>
                        <Form.Item<FieldType> name="note" rules={[{ required: true }]}>
                           <Input.TextArea rows={3} maxLength={300} showCount placeholder="Nhập lý do" />
                        </Form.Item>
                     </section>
                     <section className="mt-layout">
                        <header className="mb-2">
                           <h2 className="text-base font-medium">Biên nhận bảo hành</h2>
                           <p className="font-base text-sm text-neutral-500">Vui lòng tải biên nhận bảo hành</p>
                        </header>
                        <ImageUploader imageUris={images} setImageUris={setImages} />
                     </section>
                  </>
               )}
            </Form>
         )}
      </Modal>
   )
}

export default Issue_WarrantyFailedModal
export type { Issue_WarrantyFailedModalProps }
