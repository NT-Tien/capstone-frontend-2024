import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import { Button, Drawer, DrawerProps, Form, Input } from "antd"

type FieldType = {
   note: string
}

type Request_CloseDrawerProps = {
   requestId?: string
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> & Request_CloseDrawerProps

function Request_CloseDrawer(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const mutate_close = head_maintenance_mutations.request.close()

   function handleFinish(values: FieldType) {
      if (!props.requestId) return
      mutate_close.mutate(
         {
            id: props.requestId,
            payload: {
               note: values.note,
            },
         },
         {
            onSuccess: () => {
               props.onSuccess?.()
            },
         },
      )
   }

   return (
      <Form form={form} onFinish={handleFinish} layout="vertical">
         <Drawer
            title="Đóng yêu cầu"
            placement="bottom"
            height="max-content"
            classNames={{
               footer: "p-layout",
            }}
            footer={
               <Form.Item shouldUpdate noStyle>
                  {(values) => {
                     const disabled = !values.getFieldsValue().note
                     return (
                        <Button block type="primary" disabled={disabled} onClick={form.submit}>
                           Đóng yêu cầu
                        </Button>
                     )
                  }}
               </Form.Item>
            }
            {...props}
         >
            <Form.Item<FieldType> name="note" label="Ghi chú thêm" rules={[{ required: true }]}>
               <Input.TextArea rows={4} placeholder="Nhập ghi chú thêm" />
            </Form.Item>
         </Drawer>
      </Form>
   )
}

export default Request_CloseDrawer
export type { Request_CloseDrawerProps }
