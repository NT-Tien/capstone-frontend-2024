"use client"

import { App, Avatar, Button, Card, Drawer, Form, Input } from "antd"
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner"
import React, { useRef, useState } from "react"
import RootHeader from "@/common/components/RootHeader"
import { useRouter } from "next/navigation"
import { InfoCircleFilled, RightOutlined, SearchOutlined } from "@ant-design/icons"
import { isUUID } from "@/common/util/isUUID.util"
import { useTranslation } from "react-i18next"

type FieldType = {
   deviceId: string
}

export default function StockkeeperScanPage() {
   const router = useRouter()
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
         await message.open({
            content: t("invalidDeviceId"),
            duration: 0,
            type: "error",
            key: "messenger",
         })
         return
      }

      await message.open({
         content: t("deviceIdScanned"),
         duration: 0,
         type: "success",
         key: "messenger",
      })
      router.push(`/stockkeeper/mobile/tasks/${id}`)
   }

   return (
      <>
         <div className="h-full">
            <div>
               <RootHeader title="Quét mã QR" className="p-4" icon={<SearchOutlined />} />
               <Scanner
                  paused={false}
                  onScan={handleScan}
                  allowMultiple={true}
                  scanDelay={1000}
                  components={{}}
                  constraints={{}}
                  styles={{
                     container: {
                        width: "100%",
                        height: "100%",
                     },
                  }}
               />
               <div className="p-4">
                  <Card size="small" hoverable onClick={() => setManualOpen(true)}>
                     <div className="flex items-center gap-3">
                        <Avatar style={{ fontSize: "18px", textAlign: "center", backgroundColor: "#6750A4" }}>
                           AI
                        </Avatar>
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
            </div>
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
