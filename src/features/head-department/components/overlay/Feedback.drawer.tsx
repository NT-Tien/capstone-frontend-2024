"use client"

import { Button, Drawer, DrawerProps, Input, Select } from "antd"
import head_department_mutations from "@/features/head-department/mutations"
import AlertCard from "@/components/AlertCard"
import Form from "antd/es/form"
import FeedbackValues from "@/lib/constants/FeedbackValues"

type FieldType = {
   feedbackSelect: string
   note?: string
}

type FeedbackDrawerProps = {
   onSuccess?: () => void
   requestId?: string
}
type Props = Omit<DrawerProps, "children"> & FeedbackDrawerProps

function FeedbackDrawer(props: Props) {
   const [form] = Form.useForm<FieldType>()

   const mutate_UpdateCloseRequest = head_department_mutations.request.addFeedback()

   function handleSubmit(values: FieldType, requestId: string) {
      mutate_UpdateCloseRequest.mutate(
         {
            id: requestId,
            payload: {
               content: values.feedbackSelect + (values.note ? `: ${values.note}` : ""),
            },
         },
         {
            onSuccess: props.onSuccess,
         },
      )
   }

   return (
      <>
         <Drawer
            title="Xác nhận và Đánh giá"
            placement="bottom"
            height="50%"
            footer={
               <Button block type="primary" size={"large"} onClick={form.submit}>
                  Gửi
               </Button>
            }
            classNames={{
               footer: "p-layout",
            }}
            {...props}
         >
            <AlertCard text="Vui lòng đánh giá quá trình sửa chữa và thêm ghi chú" type="info" className="mb-3" />
            <Form<FieldType>
               form={form}
               layout="vertical"
               onFinish={(values) => props.requestId && handleSubmit(values, props.requestId)}
            >
               <Form.Item<FieldType> name="feedbackSelect" label="Đánh giá" rules={[{ required: true }]}>
                  <Select options={FeedbackValues} placeholder="Chọn đánh giá" showSearch />
               </Form.Item>
               <Form.Item<FieldType> name={"note"} label="Mô tả thêm">
                  <Input.TextArea maxLength={300} showCount placeholder="Ghi thêm mô tả" />
               </Form.Item>
            </Form>
         </Drawer>
      </>
   )
}

export default FeedbackDrawer
export type { FeedbackDrawerProps }
