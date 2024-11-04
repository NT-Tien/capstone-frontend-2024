import ScannerInputManualDrawer from "@/components/overlays/ScannerInputManual.drawer"
import useModalControls from "@/lib/hooks/useModalControls"
import { InfoCircleOutlined, RightOutlined, SendOutlined } from "@ant-design/icons"
import { Scanner } from "@yudiel/react-qr-scanner"
import { App, Avatar, Button, Card, Drawer, DrawerProps, Form, Input } from "antd"
import { forwardRef, ReactNode, useImperativeHandle } from "react"
import AlertCard from "@/components/AlertCard"
import { isUUID } from "@/lib/utils/isUUID.util"

export type ScannerV2DrawerRefType = {
   handleOpen: () => void
   handleClose: () => void
}

type Props = {
   children?: (handleOpen: () => void) => ReactNode
   onScan: (result: string) => void
   drawerProps?: DrawerProps
   alertText?: string
}

const ScannerV2Drawer = forwardRef<ScannerV2DrawerRefType, Props>(function Component({ children, ...props }, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         form.resetFields()
      },
   })
   const [form] = Form.useForm()
   const { message } = App.useApp()

   useImperativeHandle(ref, () => ({
      handleOpen,
      handleClose,
   }))

   async function handleFinish(res: string, handleCloseManual?: () => void) {
      props.onScan(res)
      handleCloseManual?.()
      handleClose()
   }

   async function handleFormSubmit() {
      try {
         await form.validateFields()
         const values = form.getFieldsValue()
         await handleFinish(values.deviceId)
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
         {children?.(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title="Quét mã QR"
            placement="bottom"
            height="max-content"
            destroyOnClose
            classNames={{
               footer: "p-layout",
               body: "overflow-y-auto",
            }}
            footer={
               <section>
                  <Form form={form} layout="horizontal" requiredMark={false}>
                     <Form.Item
                        name="deviceId"
                        label="Nhập thủ công Mã thiết bị"
                        rules={[
                           { required: true, message: "ID của thiết bị là bắt buộc" },
                           {
                              validator: (_, value) =>
                                 isUUID(value) ? Promise.resolve() : Promise.reject("ID của thiết bị không hợp lệ"),
                           },
                        ]}
                     >
                        <Input
                           placeholder="e.g., e31d662e-05db-4bc4-8bfd-773f56618725"
                           size="large"
                           allowClear
                           suffix={<Button type="primary" onClick={handleFormSubmit} icon={<SendOutlined />}></Button>}
                        />
                     </Form.Item>
                  </Form>
               </section>
            }
            {...props.drawerProps}
         >
            <AlertCard type="info" className="mb-3" text={props.alertText ?? "Vui lòng đặt mã QR vào ô bên dưới"} />
            {/*<section className="grid place-items-center">*/}
            {/*   <div className="mb-6 flex items-center gap-3 rounded-full border-2 border-neutral-200 bg-white px-2 py-1">*/}
            {/*      <InfoCircleOutlined />*/}
            {/*      <span className="text-xs">*/}
            {/*         Vui lòng đặt<strong className="mx-1 font-semibold">mã QR của thiết bị</strong>vào khung hình*/}
            {/*      </span>*/}
            {/*   </div>*/}
            {/*</section>*/}
            <section className={"aspect-square w-full"}>
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
                        // width: "100%",
                        // aspectRatio: "1/1",
                        // borderRadius: "1rem !important",
                     },
                     video: {
                        // borderRadius: "1rem !important",
                     },
                  }}
               />
            </section>
         </Drawer>
      </>
   )
})

export default ScannerV2Drawer
