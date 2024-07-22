import React, { ReactNode, useRef, useState } from "react"
import { App, Avatar, Button, Card, Drawer, DrawerProps, Form, Input } from "antd"
import { InfoCircleFilled, InfoCircleOutlined, RightOutlined } from "@ant-design/icons"
import { isUUID } from "@/common/util/isUUID.util"
import { useTranslation } from "react-i18next"
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner"

type FieldType = {
   deviceId: string
}

type Props = {
   children: (handleOpen: () => void) => ReactNode
   onScan: (result: string) => void
   drawerProps?: DrawerProps
}

export default function ScannerDrawer({ children, ...props }: Props) {
   const [form] = Form.useForm<FieldType>()
   const { t } = useTranslation()

   const [open, setOpen] = useState(false)
   const [manualInputDrawerOpen, setManualInputDrawerOpen] = useState(false)

   async function handleFinish(res: string) {
      handleClose()
      props.onScan(res)
   }

   function handleOpen() {
      setOpen(true)
   }

   function handleClose() {
      form.resetFields()
      setOpen(false)
      setManualInputDrawerOpen(false)
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title="Quét mã QR"
            placement="bottom"
            height="max-content"
            {...props.drawerProps}
         >
            <section className="grid place-items-center">
               <div className="mb-6 flex items-center rounded-full border-2 border-neutral-200 bg-white px-6 py-1">
                  Vui lòng đặt <strong className="mx-1.5 font-semibold">mã QR của thiết bị</strong> vào khung hình
                  <InfoCircleOutlined className="ml-2" />
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
            <Card size="small" hoverable onClick={() => setManualInputDrawerOpen(true)} className="mt-layout">
               <div className="flex items-center gap-3">
                  <Avatar style={{ fontSize: "18px", textAlign: "center", backgroundColor: "#6750A4" }}>AI</Avatar>
                  <div className="flex-grow">
                     <p className="text-base font-bold">{t("InputManually")}</p>
                     <p className="text-xs">{t("CannotScan")}</p>
                  </div>
                  <div>
                     <Button type="text" icon={<RightOutlined />} />
                  </div>
               </div>
            </Card>
         </Drawer>
         <Drawer
            title={t("InputManually")}
            placement="bottom"
            onClose={() => {
               setManualInputDrawerOpen(false)
               form.resetFields()
            }}
            open={manualInputDrawerOpen}
            height="max-content"
            size="default"
            classNames={{
               body: "flex flex-col",
            }}
         >
            <Form<FieldType> form={form} onFinish={(e) => handleFinish(e.deviceId)} layout="horizontal">
               <Card size="small" hoverable className="mb-4">
                  <div className="flex gap-2">
                     <InfoCircleFilled />
                     <div className="text-xs">Nhập ID thiết bị</div>
                  </div>
               </Card>
               <Form.Item<FieldType>
                  name="deviceId"
                  label="ID thiết bị"
                  labelAlign="left"
                  labelCol={{
                     span: 24,
                     className: "pb-0",
                  }}
                  rules={[
                     { required: true },
                     {
                        validator: (_, value) =>
                           isUUID(value) ? Promise.resolve() : Promise.reject("ID thiết bị không hợp lệ"),
                     },
                  ]}
                  className="flex-grow"
               >
                  <Input placeholder="e.g., 123-1231231-312312-3123123123" size="large" />
               </Form.Item>
               <Button
                  key="submit-btn"
                  type="primary"
                  htmlType="submit"
                  onClick={form.submit}
                  className="w-full"
                  size="large"
               >
                  {t("Submit")}
               </Button>
            </Form>
         </Drawer>
      </>
   )
}
