"use client"

import { App, Avatar, Button, Card, Drawer, Form, Input } from "antd"
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner"
import React, { useRef, useState } from "react"
import RootHeader from "@/common/components/RootHeader"
import { useRouter } from "next/navigation"
import { InfoCircleFilled, QrcodeOutlined, RightOutlined } from "@ant-design/icons"
import { isUUID } from "@/common/util/isUUID.util"

type FieldType = {
   deviceId: string
}

export default function ScanPage() {
   const router = useRouter()
   const [manualOpen, setManualOpen] = useState(false)
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()
   const timeoutRef = useRef<NodeJS.Timeout>()

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
            content: "Invalid Device ID",
            duration: 0,
            type: "error",
            key: "messenger",
         })
         return
      }

      await message.open({
         content: "Device ID Scanned",
         duration: 0,
         type: "success",
         key: "messenger",
      })
      router.push(`/head/scan/${id}`)
   }

   return (
      <>
         <div className="h-full">
            <div>
               <RootHeader title="Scan" className="p-4" icon={<QrcodeOutlined />} />
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
                           <p className="text-base font-bold">Input Manually</p>
                           <p className="text-xs">Click here if you cannot scan the QR Code</p>
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
               title="Manual Input"
               placement="bottom"
               onClose={() => setManualOpen(false)}
               open={manualOpen}
               height={260}
               size="default"
               extra={[
                  <Button key="submit-btn" type="primary" htmlType="submit" onClick={form.submit}>
                     Submit
                  </Button>,
               ]}
               classNames={{
                  body: "flex flex-col",
               }}
            >
               <Form.Item<FieldType>
                  name="deviceId"
                  label="Device ID"
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
               <Card size="small" hoverable>
                  <div className="flex gap-3">
                     <InfoCircleFilled />
                     <div className="text-xs">Please input the Device ID manually if you cannot scan the QR Code</div>
                  </div>
               </Card>
            </Drawer>
         </Form>
      </>
   )
}