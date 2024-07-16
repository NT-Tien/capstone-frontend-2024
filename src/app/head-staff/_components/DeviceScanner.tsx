"use client"

import { App, Avatar, Button, Card, Drawer, Form, Input } from "antd"
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner"
import React, { useRef, useState } from "react"
import RootHeader from "@/common/components/RootHeader"
import { useRouter } from "next/navigation"
import { InfoCircleFilled, InfoCircleOutlined, RightOutlined, SearchOutlined } from "@ant-design/icons"
import { isUUID } from "@/common/util/isUUID.util"
import { useTranslation } from "react-i18next"

type FieldType = {
   deviceId: string
}

interface HeadStaffScanPageProps {
   onScanResult: (deviceId: string) => void
   onClose: () => void
   open: boolean
}

const DeviceScanner: React.FC<HeadStaffScanPageProps> = ({ onScanResult, onClose, open }) => {
   const [manualOpen, setManualOpen] = useState(false)
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()
   const timeoutRef = useRef<NodeJS.Timeout>()
   const { t } = useTranslation()

   async function handleScan(e: IDetectedBarcode[]) {
      if (e.length === 0) return

      const currentId = e[0].rawValue

      // only continue if currentId exists
      if (currentId) {
         await finishHandler(currentId)
      }
   }

   async function finishHandler(id: string) {
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
         message.destroy("messenger")
      }, 3000)

      if (!isUUID(id)) {
         message.open({
            content: t("invalidDeviceId"),
            duration: 0,
            type: "error",
            key: "messenger",
         })
         return
      }

      message.open({
         content: t("deviceIdScanned"),
         duration: 0,
         type: "success",
         key: "messenger",
      })
      onScanResult(id)
      onClose()
   }

   return (
      <>
         <div className="h-full">
            <section className="grid place-items-center">
               <div className="mb-6 flex items-center rounded-full border-2 border-neutral-200 bg-white px-6 py-1">
                  Place <strong className="mx-1.5 font-semibold">device QR Code</strong> into the frame
                  <InfoCircleOutlined className="ml-2" />
               </div>
            </section>
            <Scanner
               paused={open}
               onScan={handleScan}
               allowMultiple={true}
               scanDelay={1000}
               components={{}}
               constraints={{}}
               styles={{
                  container: {
                     width: "100%",
                     height: "380px",
                  },
               }}
            />
            <Card size="small" hoverable onClick={() => setManualOpen(true)} className="mt-layout">
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
         </div>
         <Form<FieldType> form={form} onFinish={(e) => finishHandler(e.deviceId)} layout="horizontal">
            <Drawer
               title={t("InputManually")}
               placement="bottom"
               onClose={() => setManualOpen(false)}
               open={manualOpen}
               height="max-content"
               size="default"
               classNames={{
                  body: "flex flex-col",
               }}
            >
               <Card size="small" hoverable className="mb-4">
                  <div className="flex gap-2">
                     <InfoCircleFilled />
                     <div className="text-xs">{t("inputDeviceId")}</div>
                  </div>
               </Card>
               <Form.Item<FieldType>
                  name="deviceId"
                  label={t("DeviceId")}
                  labelAlign="left"
                  labelCol={{
                     span: 24,
                     className: "pb-0",
                  }}
                  rules={[
                     { required: true },
                     {
                        validator: (_, value) =>
                           isUUID(value) ? Promise.resolve() : Promise.reject("Invalid Device ID"),
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
            </Drawer>
         </Form>
      </>
   )
}
export default DeviceScanner