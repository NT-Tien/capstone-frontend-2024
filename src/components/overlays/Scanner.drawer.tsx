import ScannerInputManualDrawer from "@/components/overlays/ScannerInputManual.drawer"
import useModalControls from "@/lib/hooks/useModalControls"
import { InfoCircleFilled, InfoCircleOutlined, RightOutlined } from "@ant-design/icons"
import { Scanner } from "@yudiel/react-qr-scanner"
import { App, Avatar, Button, Card, Drawer, DrawerProps, Form, Input } from "antd"
import { ReactNode } from "react"
import { isUUID } from "@/lib/utils/isUUID.util"

type Props = {
   children: (handleOpen: () => void) => ReactNode
   onScan: (result: string) => void
   drawerProps?: DrawerProps
}
type FieldType = {
   deviceId: string
}
export default function ScannerDrawer(
   { children, ...props }: Props,
   prop: {
      children: (handleOpen: () => void) => ReactNode
      onFinish: (deviceId: string, handleClose?: () => void) => Promise<void>
      drawerProps?: DrawerProps
      disabled?: boolean
   },
) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         form.resetFields()
      },   })

   async function handleFinish(res: string, handleCloseManual?: () => void) {
      props.onScan(res)
      handleCloseManual?.()
      handleClose()
   }
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()

   async function handleFinishInput() {
      try {
         await form.validateFields()

         const values = form.getFieldsValue()

         await prop.onFinish(values.deviceId, handleClose)
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
         {children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title="Quét mã QR"
            placement="bottom"
            height="max-height"
            destroyOnClose
            {...props.drawerProps}
         >
            <section className="grid place-items-center">
               <div className="mb-6 flex items-center gap-3 rounded-full border-2 border-neutral-200 bg-white px-2 py-1">
                  <InfoCircleOutlined />
                  <span className="text-xs">
                     Vui lòng đặt<strong className="mx-1 font-semibold">mã QR của thiết bị</strong>vào khung hình
                  </span>
               </div>
            </section>
            <Scanner
               paused={!open}
               onScan={async (e) => {
                  if (e.length === 0) return

                  const currentId = e[0].rawValue

                  // only continue if currentId exists
                  if (currentId) {
                     await handleFinish(currentId)
                  }
               }}
               allowMultiple={true}
               scanDelay={1000}
               components={{}}
               constraints={{}}
               styles={{
                  container: {
                     width: "100%",
                     aspectRatio: "1/1",
                     borderRadius: "1rem !important",
                  },
                  video: {
                     borderRadius: "1rem !important",
                  },
               }}
            />
            <section className="p-4">
               <Form<FieldType> disabled={prop.disabled} form={form} layout="horizontal">
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
               <Button key="submit-btn" type="primary" onClick={handleFinishInput} className="w-full" size="large">
                  Gửi
               </Button>
            </section>
         </Drawer>
      </>
   )
}
