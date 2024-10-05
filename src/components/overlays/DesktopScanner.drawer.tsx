import ScannerInputManualDrawer from "@/components/overlays/ScannerInputManual.drawer"
import useModalControls from "@/lib/hooks/useModalControls"
import { RightOutlined } from "@ant-design/icons"
import { Scanner } from "@yudiel/react-qr-scanner"
import { App, Avatar, Button, Card, Drawer, DrawerProps, Form, Input } from "antd"
import { ReactNode, useState } from "react"
import AlertCard from "@/components/AlertCard"
import { isUUID } from "@/lib/utils/isUUID.util"

type Props = {
   children: (handleOpen: () => void) => ReactNode
   onScan: (result: string) => void
   drawerProps?: DrawerProps
   alertText?: string
}

type FieldType = {
   deviceId: string
}

export default function DesktopScannerDrawer({ children, ...props }: Props) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         form.resetFields()
      },
   })

   const [form] = Form.useForm<FieldType>()
   const [manualInputVisible, setManualInputVisible] = useState(false)
   const { message } = App.useApp()

   async function handleFinish(res: string, handleCloseManual?: () => void) {
      props.onScan(res)
      handleCloseManual?.()
      handleClose()
   }

   async function handleManualSubmit() {
      try {
         await form.validateFields()
         const values = form.getFieldsValue()
         await props.onScan(values.deviceId)
         handleClose()
      } catch (e) {
         message.error("Invalid Device ID. Please check again.")
      }
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title="Quét mã QR"
            placement="right"
            width="30%"
            destroyOnClose
            classNames={{
               footer: "p-layout",
            }}
            footer={
               <section>
                  <Form<FieldType> form={form} layout="horizontal">
                     <Form.Item<FieldType>
                        name="deviceId"
                        label="ID của thiết bị"
                        labelAlign="left"
                        labelCol={{ span: 24 }}
                        rules={[
                           { required: true, message: "Please enter a device ID" },
                           {
                              validator: (_, value) =>
                                 isUUID(value) ? Promise.resolve() : Promise.reject("Invalid Device ID"),
                           },
                        ]}
                        normalize={(value) => {
                           return value.replace(/-/g, "").slice(0, 36)
                        }}
                     >
                        <Input
                           placeholder="e.g., e31d662e-05db-4bc4-8bfd-773f56618725"
                           size="large"
                           autoComplete="off"
                           allowClear
                        />
                     </Form.Item>
                     <Button type="primary" onClick={handleManualSubmit} className="w-full" size="large">
                        Gửi
                     </Button>
                  </Form>
               </section>
            }
            {...props.drawerProps}
         >
            <div className="w-96">
               <AlertCard
                  className="mb-layout"
                  text={props.alertText ?? "Đặt mã QR vào khung quét để bắt đầu"}
                  type="info"
               />
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
                        width: "24rem",
                        //  aspectRatio: "1/1",
                        //  borderRadius: "1rem !important",
                     },
                  }}
               />
            </div>
         </Drawer>
      </>
   )
}
