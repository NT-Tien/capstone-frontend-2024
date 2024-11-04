"use client"

import { isUUID } from "@/lib/utils/isUUID.util"
import { InfoCircleOutlined } from "@ant-design/icons"
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner"
import { App, Button, Card, Form, Input, Spin } from "antd"
import { useRef } from "react"
import HeadNavigationDrawer from "@/features/head-department/components/layout/HeadNavigationDrawer"
import PageHeader from "@/components/layout/PageHeader"
import AlertCard from "@/components/AlertCard"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import ScanDetailsDrawer, {
   ScanDetailsDrawerProps,
} from "@/features/head-department/components/overlay/ScanDetails.drawer"
import head_department_queries from "@/features/head-department/queries"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import PageHeaderV2 from "@/components/layout/PageHeaderV2"
import uuidNormalizer from "@/lib/utils/uuid-normalizer.util"

export default function ScanPage() {
   const navDrawer = HeadNavigationDrawer.useDrawer()
   const { message } = App.useApp()
   const timeoutRef = useRef<NodeJS.Timeout>()
   const [form] = Form.useForm()
   const queryClient = useQueryClient()
   const isFetching = useIsFetching({
      queryKey: head_department_queries.device.oneById
         .qk({
            id: "",
         })
         .slice(0, 2),
   })

   const control_scanDetailsDrawer = useRef<RefType<ScanDetailsDrawerProps>>(null)

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

      try {
         const device = await queryClient.fetchQuery(
            head_department_queries.device.oneById.queryOptions({
               id,
            }),
         )

         console.log("test device:", device)

         control_scanDetailsDrawer.current?.handleOpen({
            device,
         })
      } catch (e) {
         await message.error({
            content: "Không tìm thấy thiết bị",
            duration: 0,
            key: "messenger",
         })
      }

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
         <PageHeaderV2
            title={"Tạo yêu cầu"}
            type={"dark"}
            nextButton={<PageHeaderV2.InfoButton />}
            prevButton={<PageHeaderV2.MenuButton onClick={navDrawer.handleOpen} />}
         />
         <div className="px-layout py-3">
            <AlertCard text="Vui lòng quét mã QR hoặc nhập ID của thiết bị" icon={<InfoCircleOutlined />} type="info" />
         </div>
         {isFetching > 0 && <Spin fullscreen />}
         <section className={"aspect-square h-full w-full"}>
            <Scanner
               paused={false}
               formats={["qr_code"]}
               onScan={handleScan}
               allowMultiple={true}
               scanDelay={1000}
               components={{}}
               constraints={{
                  aspectRatio: 1,
               }}
               styles={{
                  video: {
                     width: "100%",
                     height: "100%",
                  },
               }}
            />
         </section>
         <Form form={form} layout="horizontal" onFinish={handleManualSubmit} className="mt-4 px-layout">
            <Card
               size="small"
               classNames={{
                  actions: "p-2 *:m-0",
               }}
               actions={[
                  <Button key={1} type="link" block size="large" onClick={() => form.resetFields()}>
                     Xóa
                  </Button>,
                  <div key={2} className="ml-2">
                     <Button type="primary" block htmlType="submit" size="large" loading={isFetching > 0}>
                        Gửi
                     </Button>
                  </div>,
               ]}
            >
               <Form.Item
                  name="deviceId"
                  label="Mã thiết bị"
                  validateDebounce={1000}
                  validateFirst
                  validateTrigger={["onSubmit"]}
                  rules={[
                     { required: true, message: "Vui lòng nhập mã thiết bị", validateTrigger: "onSubmit" },
                     {
                        validator: (_, value) =>
                           isUUID(value) ? Promise.resolve() : Promise.reject("Mã thiết bị không hợp lệ"),
                     },
                  ]}
                  normalize={uuidNormalizer}
               >
                  <Input
                     placeholder="e.g., e31d662e-05db-4bc4-8bfd-773f56618725"
                     size="large"
                     autoComplete="off"
                     maxLength={36}
                     allowClear
                     enterKeyHint="send"
                     onKeyDown={(e) => {
                        if (e.key === "Enter") {
                           handleManualSubmit().then()
                        }
                     }}
                  />
               </Form.Item>
            </Card>
         </Form>
         <OverlayControllerWithRef ref={control_scanDetailsDrawer}>
            <ScanDetailsDrawer />
         </OverlayControllerWithRef>
      </div>
   )
}
