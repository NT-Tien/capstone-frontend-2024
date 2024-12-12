"use client"

import FullPageQrScanner from "@/components/FullPageQrScanner"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import ScanDetailsDrawer, {
   ScanDetailsDrawerProps,
} from "@/features/head-department/components/overlay/ScanDetails.drawer"
import { cn } from "@/lib/utils/cn.util"
import { isUUID } from "@/lib/utils/isUUID.util"
import uuidNormalizer from "@/lib/utils/uuid-normalizer.util"
import { EllipsisOutlined, IdcardOutlined, LeftOutlined, SendOutlined } from "@ant-design/icons"
import { App, Button, Form, Input } from "antd"
import { useRouter } from "next/navigation"
import { useRef } from "react"

type FieldType = {
   deviceId: string
}

function Page() {
   const router = useRouter()
   const { message } = App.useApp()

   const [form] = Form.useForm<FieldType>()
   const control_scanDetailsDrawer = useRef<RefType<ScanDetailsDrawerProps>>(null)

   function handleSubmit(value: string) {
      if (!isUUID(value)) {
         message.error("Mã không hợp lệ")
         return
      }

      control_scanDetailsDrawer.current?.handleOpen({
         id: value,
      })
   }

   return (
      <>
         <FullPageQrScanner
            infoSection={<FullPageQrScanner.InfoSection_1>Quét mã QR Thiết bị</FullPageQrScanner.InfoSection_1>}
            onScan={(value) => {
               handleSubmit(value)
            }}
         >
            {(status) => {
               console.log(status)
               return (
                  <>
                     <PageHeaderV2
                        title="Quét mã"
                        prevButton={
                           <PageHeaderV2.Button
                              icon={
                                 <LeftOutlined
                                    className={cn("text-xl text-white", status !== "started" && "text-black")}
                                 />
                              }
                              onClick={() => router.back()}
                           />
                        }
                        nextButton={
                           <PageHeaderV2.Button
                              icon={
                                 <EllipsisOutlined
                                    className={cn("text-xl text-white", status !== "started" && "text-black")}
                                 />
                              }
                           />
                        }
                        className={cn("absolute left-0 right-0 top-0 w-full bg-transparent")}
                        classNames={{
                           title: cn("text-xl text-white", status !== "started" && "text-black"),
                        }}
                     />

                     <footer className="absolute bottom-0 left-0 w-full rounded-t-xl bg-white p-layout shadow-lg">
                        <Form<FieldType>
                           form={form}
                           onFinish={(values) => handleSubmit(values.deviceId)}
                           onFinishFailed={() => {
                              message.destroy("deviceId")
                              message.error({
                                 key: "deviceId",
                                 content: "Mã thiết bị không đúng định dạng",
                              })
                              message.error({
                                 key: "deviceArea",
                                 content: "Mã thiết bị không tồn tại"
                              })
                           }}
                        >
                           <Form.Item<FieldType>
                              name={"deviceId"}
                              noStyle
                              rules={[
                                 {
                                    required: true,
                                 },
                                 {
                                    validator: (_, value) =>
                                       isUUID(value) ? Promise.resolve() : Promise.reject("Mã không hợp lệ"),
                                    validateTrigger: ["onSubmit"],
                                 },
                              ]}
                              normalize={uuidNormalizer}
                           >
                              <Input.Search
                                 enterButton={<Button icon={<SendOutlined />} type={"primary"} />}
                                 onSearch={form.submit}
                                 placeholder="Nhập mã thiết bị..."
                                 size="large"
                                 prefix={<IdcardOutlined />}
                                 allowClear
                              />
                           </Form.Item>
                        </Form>
                     </footer>
                  </>
               )
            }}
         </FullPageQrScanner>
         <OverlayControllerWithRef ref={control_scanDetailsDrawer}>
            <ScanDetailsDrawer />
         </OverlayControllerWithRef>
      </>
   )
}

export default Page
