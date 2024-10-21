"use client"

import RootHeader from "@/components/layout/RootHeader"
import ScannerInputManualDrawer from "@/components/overlays/ScannerInputManual.drawer"
import { isUUID } from "@/lib/utils/isUUID.util"
import { InfoCircleOutlined, MenuOutlined, RightOutlined, SearchOutlined } from "@ant-design/icons"
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner"
import { App, Avatar, Button, Card, Form, Input, Spin } from "antd"
import { useRouter } from "next/navigation"
import { useRef, useTransition } from "react"
import { InfoCircleFilled } from "@ant-design/icons"
import HeadNavigationDrawer from "@/features/head-department/components/layout/HeadNavigationDrawer"

export default function ScanPage() {
   const navDrawer = HeadNavigationDrawer.useDrawer()
   const router = useRouter()
   const { message } = App.useApp()
   const timeoutRef = useRef<NodeJS.Timeout>()
   const [form] = Form.useForm()

   const [isLoading, startTransition] = useTransition()

   async function handleScan(e: IDetectedBarcode[]) {
      if (e.length === 0) return

      const currentId = e[0].rawValue

      // only continue if currentId exists
      if (currentId) {
         await finishHandler(currentId)
      }
   }

   async function finishHandler(id: string, handleClose?: () => void) {
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

      handleClose?.()

      setTimeout(() => {
         startTransition(() => {
            router.push(`/head/scan/${id}`)
         })
      }, 200)

      return
   }

   async function handleManualSubmit() {
      try {
         const values = await form.validateFields()
         await finishHandler(values.deviceId)
      } catch (error) {
         message.error("Vui lòng nhập ID hợp lệ.")
      }
   }

   return (
      <div className="h-full">
         {isLoading && <Spin fullscreen className="z-[5000]" />}
         <div>
            <RootHeader
               title="Quét mã QR"
               className="px-layout py-layout align-middle"
               icon={<MenuOutlined />}
               onIconClick={() => navDrawer.handleOpen()}
            />
            <section className="my-6 grid place-items-center">
               <div className="flex items-center rounded-full bg-white px-6 py-1">
                  <div>
                     Vui lòng đặt<strong className="mx-1.5 font-semibold">mã QR của thiết bị</strong>vào khung hình
                  </div>
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
                     aspectRatio: "1/1",
                     // borderRadius: "1rem !important",
                  },
                  video: {
                     borderRadius: "1rem !important",

                     // height: "1000px",
                  },
               }}
            />
            <section className="p-4">
               <Card size="small" hoverable>
                  <Card size="small" hoverable className="mb-4">
                     <div className="flex items-start gap-2">
                        <InfoCircleFilled className="mt-1" />
                        <div className="text-base">Vui lòng nhập ID của thiết bị nếu như bạn không thể quét mã QR</div>
                     </div>
                  </Card>
                  <Form form={form} layout="horizontal" onFinish={handleManualSubmit}>
                     <Form.Item
                        name="deviceId"
                        label="ID của thiết bị"
                        validateDebounce={1000}
                        validateFirst
                        rules={[
                           { required: true, message: "Vui lòng nhập ID của thiết bị" },
                           {
                              validator: (_, value) =>
                                 isUUID(value) ? Promise.resolve() : Promise.reject("ID thiết bị không hợp lệ"),
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
                           maxLength={36}
                           allowClear
                        />
                     </Form.Item>
                     <Button type="primary" htmlType="submit" className="w-full" size="large">
                        Gửi
                     </Button>
                  </Form>
               </Card>
            </section>
         </div>
      </div>
   )
}
