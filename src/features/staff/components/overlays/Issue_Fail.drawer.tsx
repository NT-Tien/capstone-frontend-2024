"use client"

import { Button, Checkbox, Drawer, DrawerProps, Select } from "antd"
import TextArea from "antd/es/input/TextArea"
import Form from "antd/es/form"
import { CloseOutlined } from "@ant-design/icons"
import staff_mutations from "@/features/staff/mutations"
import { useEffect, useState } from "react"

type FieldType = {
   reason: string
   note?: string
}
type IssueFailDrawerProps = {
   issueId?: string
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   IssueFailDrawerProps & {
      handleClose?: () => void
   }

function IssueFailDrawer(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const form_reason = Form.useWatch("reason", form)

   const [checked, setChecked] = useState<boolean>(false)

   const mutate_failIssue = staff_mutations.issues.failed()

   function handleSubmit(values: FieldType, issueId: string) {
      mutate_failIssue.mutate(
         {
            id: issueId,
            payload: {
               failReason: values.reason + ": " + values.note,
            },
         },
         {
            onSuccess: () => {
               props.onSuccess?.()
               props.handleClose?.()
            },
         },
      )
   }

   useEffect(() => {
      if (!props.open) {
         setChecked(false)
         form.resetFields()
      }
   }, [form, props.open])

   return (
      <Drawer
         title={"Hủy lỗi"}
         placement={"bottom"}
         height={"55%"}
         closeIcon={<CloseOutlined className={"text-white"} />}
         classNames={{
            footer: "p-layout",
            header: "bg-staff text-white",
         }}
         footer={
            <div>
               <div className={"mb-layout flex items-center gap-2"}>
                  <Checkbox id={"issue_fail_check"} checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                  <label htmlFor={"issue_fail_check"}>Tôi muốn hủy lỗi trên</label>
               </div>
               <Button block type="primary" size={"large"} danger disabled={!checked} onClick={form.submit}>
                  Hủy lỗi
               </Button>
            </div>
         }
         {...props}
      >
         <Form<FieldType>
            form={form}
            layout={"vertical"}
            onFinish={(value) => props.issueId && handleSubmit(value, props.issueId)}
         >
            <Form.Item<FieldType> name={"reason"} label={"Lý do hủy lỗi"} rules={[{ required: true }]}>
               <Select
                  size="large"
                  placeholder="Chọn lý do"
                  options={[
                     { label: "Thiếu linh kiện", value: "Thiếu linh kiện" },
                     { label: "Chẩn đoán lỗi sai", value: "Chẩn đoán lỗi sai" },
                     { label: "Máy cần kiểm tra lại", value: "Máy cần kiểm tra lại" },
                     { label: "Lý do khác", value: "Lý do khác" },
                  ]}
               />
            </Form.Item>

            <Form.Item<FieldType> name={"note"} label={"Ghi chú"} rules={[{ required: form_reason === "Lý do khác" }]}>
               <TextArea placeholder="Thêm ghi chú" size="large" rows={3} maxLength={300} showCount />
            </Form.Item>
         </Form>
      </Drawer>
   )
}

export default IssueFailDrawer
export type { IssueFailDrawerProps }
