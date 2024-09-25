"use client"

import useModalControls from "@/lib/hooks/useModalControls"
import { isUUID } from "@/lib/utils/isUUID.util"
import { InfoCircleFilled } from "@ant-design/icons"
import { App, Button, Card, Drawer, DrawerProps, Form, Input } from "antd"
import { ReactNode } from "react"

type FieldType = {
   deviceId: string
}

export default function ScannerInputManualDrawer(props: {
   children: (handleOpen: () => void) => ReactNode
   onFinish: (deviceId: string, handleClose?: () => void) => Promise<void>
   drawerProps?: DrawerProps
   disabled?: boolean
}) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         form.resetFields()
      },
   })
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()

   async function handleFinish() {
      try {
         await form.validateFields()

         const values = form.getFieldsValue()

         await props.onFinish(values.deviceId, handleClose)
      } catch (e) {
         message.destroy("error-msg")
         message
            .error({
               content: "Không thể gửi dữ liệu. Vui lòng kiểm tra lại.",
               key: "error-msg",
            })
            .then()
      }
   }

   return (
      <>
         {props.children(handleOpen)}
         <Drawer
            title="Nhập thủ công"
            placement="bottom"
            onClose={handleClose}
            open={open}
            height="max-content"
            classNames={{
               body: "flex flex-col pb-3",
               footer: "p-layout",
            }}
            className="z-[1000]"
            footer={
               <Button key="submit-btn" type="primary" onClick={handleFinish} className="w-full" size="large">
                  Gửi
               </Button>
            }
            {...props.drawerProps}
         >
            <Form<FieldType> disabled={props.disabled} form={form} layout="horizontal">
               <Card size="small" hoverable className="mb-4">
                  <div className="flex items-start gap-2">
                     <InfoCircleFilled className="mt-1" />
                     <div className="text-base">Vui lòng nhập ID của thiết bị nếu như bạn không thể quét mã QR</div>
                  </div>
               </Card>
               <Form.Item<FieldType>
                  name="deviceId"
                  label={"ID của thiết bị"}
                  labelAlign="left"
                  labelCol={{
                     span: 24,
                     className: "pb-0",
                  }}
                  validateDebounce={1000}
                  validateFirst
                  rules={[
                     { required: true },
                     {
                        validator: (_, value) =>
                           isUUID(value) ? Promise.resolve() : Promise.reject("Invalid Device ID"),
                     },
                  ]}
                  normalize={(original) => {
                     let value = original.replace(/-/g, "")
                     if (value.length > 8) {
                        value = `${value.slice(0, 8)}-${value.slice(8)}`
                     }
                     if (value.length > 13) {
                        value = `${value.slice(0, 13)}-${value.slice(13)}`
                     }
                     if (value.length > 18) {
                        value = `${value.slice(0, 18)}-${value.slice(18)}`
                     }
                     if (value.length > 23) {
                        value = `${value.slice(0, 23)}-${value.slice(23)}`
                     }
                     if (value.length > 36) {
                        value = value.slice(0, 36)
                     }
                     return value
                  }}
               >
                  <Input
                     placeholder="e.g., e31d662e-05db-4bc4-8bfd-773f56618725"
                     size="large"
                     autoComplete="off"
                     aria-autocomplete="none"
                     max={36}
                     allowClear
                  />
               </Form.Item>
            </Form>
         </Drawer>
      </>
   )
}
