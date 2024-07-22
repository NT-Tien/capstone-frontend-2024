"use client"
//
// import { useEffect, useRef, useState } from "react"
// import QrScanner from "qr-scanner"
// import RootHeader from "@/common/components/RootHeader"
// import { InfoCircleOutlined, RightOutlined, SearchOutlined } from "@ant-design/icons"
// import { Avatar, Button, Card } from "antd"
//
// export default function ScanPage() {
//    const scanner = useRef<QrScanner>()
//    const videoEl = useRef<HTMLVideoElement>(null)
//    const qrBoxEl = useRef<HTMLDivElement>(null)
//
//    const [qrOn, setQrOn] = useState<boolean>(true)
//
//    useEffect(() => {
//       if (videoEl?.current && !scanner.current) {
//          // 👉 Instantiate the QR Scanner
//          scanner.current = new QrScanner(
//             videoEl?.current,
//             (result) => {
//                console.log("QR Code found", result.data)
//             },
//             {
//                onDecodeError: (error) => {
//                   console.log("error", error)
//                },
//                preferredCamera: "environment",
//                highlightScanRegion: true,
//                highlightCodeOutline: true,
//                overlay: qrBoxEl?.current || undefined,
//             },
//          )
//
//          scanner?.current
//             ?.start()
//             .then(() => setQrOn(true))
//             .catch((err) => {
//                console.log("something went wrong")
//                if (err) setQrOn(false)
//             })
//       }
//
//       return () => {
//          if (!videoEl?.current) {
//             scanner?.current?.stop()
//          }
//       }
//    }, [])
//
//    useEffect(() => {
//       if (!qrOn)
//          alert("Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload.")
//    }, [qrOn])
//
//    return (
//       <div className="flex h-full flex-col">
//          <RootHeader title="Scan" className="p-4" icon={<SearchOutlined />} />
//          <div className="relative h-full flex-grow">
//             <div className="absolute left-0 top-0 z-50 flex w-full flex-col items-center">
//                <section className="my-6 grid place-items-center">
//                   <div className="flex items-center rounded-lg bg-white p-1 px-3 font-semibold">
//                      Quét mã QR thiết bị
//                      <InfoCircleOutlined className="ml-2" />
//                   </div>
//                </section>
//             </div>
//             <div className="absolute bottom-0 left-0 z-50 flex w-full flex-col items-center px-layout">
//                <Card size="small" hoverable onClick={() => {}} className="w-full">
//                   <div className="flex items-center gap-3">
//                      <Avatar style={{ fontSize: "18px", textAlign: "center", backgroundColor: "#6750A4" }}>AI</Avatar>
//                      <div className="flex-grow">
//                         <p className="text-base font-bold">Input manually</p>
//                         <p className="text-xs">Input Manually</p>
//                      </div>
//                      <div>
//                         <Button type="text" icon={<RightOutlined />} />
//                      </div>
//                   </div>
//                </Card>
//             </div>
//             <div className="mx-auto h-[calc(100vh-150px)] w-screen">
//                <video ref={videoEl} className="h-full w-full object-cover" />
//                <div ref={qrBoxEl} className="left-0 w-full">
//                   <img
//                      src="/qr-frame.svg"
//                      alt="Qr Frame"
//                      width={256}
//                      height={256}
//                      className="absolute left-1/2 top-20 fill-none"
//                      style={{
//                         transform: "translate(-50%, -50%)",
//                      }}
//                   />
//                </div>
//             </div>
//          </div>
//       </div>
//    )
// }

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

export default function ScanPage() {
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
      router.push(`/head/scan/${id}`)
   }

   return (
      <>
         <div className="h-full">
            <div>
               <RootHeader title="Quét mã QR" className="p-4" />
               <section className="my-6 grid place-items-center">
                  <div className="flex items-center rounded-full bg-white px-6 py-1">
                     Vui lòng đặt <strong className="mx-1.5 font-semibold">mã QR của thiết bị</strong> vào khung hình
                     <InfoCircleOutlined className="ml-2" />
                  </div>
               </section>
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
                        height: "430px",
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
                  <div className="flex items-start gap-2">
                     <InfoCircleFilled className="mt-1" />
                     <div className="text-base">{t("inputDeviceId")}</div>
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
