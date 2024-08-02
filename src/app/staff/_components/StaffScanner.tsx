"use client"

import { isUUID } from "@/common/util/isUUID.util"
import { InfoCircleFilled, RightOutlined } from "@ant-design/icons"
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner"
import { App, Avatar, Button, Card, Drawer, Form, Input } from "antd"
import { useRef, useState } from "react"

type FieldType = {
   deviceId: string
}

type StaffScanPageProps = {
   onScanResult: (deviceId: string) => void
   onClose: () => void
   open: boolean
}

export default function StaffScanner(props: StaffScanPageProps) {
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
            content: "ID thiết bị không hợp lệ",
            duration: 0,
            type: "error",
            key: "messenger",
         })
         return
      }

      await message.open({
         content: "Quét thành công",
         duration: 0,
         type: "success",
         key: "messenger",
      })
      props.onScanResult(id)
      props.onClose()
   }

   return (
      <>
         <div className="h-full">
            <div>
               <Scanner
                  paused={props.open}
                  onScan={handleScan}
                  allowMultiple={true}
                  scanDelay={1000}
                  components={{}}
                  constraints={{}}
                  styles={{
                     container: {
                        width: "100%",
                        height: "400px",
                     },
                  }}
               />
               <Card size="small" hoverable onClick={() => setManualOpen(true)} className="mt-3">
                  <div className="flex items-center gap-3">
                     <Avatar style={{ fontSize: "18px", textAlign: "center", backgroundColor: "#6750A4" }}>AI</Avatar>
                     <div className="flex-grow">
                        <p className="text-base font-bold">Nhập thủ công</p>
                        <p className="text-xs">Nhấp vào đây nếu bạn không thể quét mã QR</p>
                     </div>
                     <div>
                        <Button type="text" icon={<RightOutlined />} />
                     </div>
                  </div>
               </Card>
            </div>
         </div>
         <Form<FieldType> form={form} onFinish={(e) => finishHandler(e.deviceId)} layout="horizontal">
            <Drawer
               title="Nhập thủ công"
   placement="left"
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
                     <div className="text-xs">Vui lòng nhập ID của thiết bị nếu như bạn không thể quét mã QR.</div>
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
                  Gửi
               </Button>
            </Drawer>
         </Form>
      </>
   )
}
