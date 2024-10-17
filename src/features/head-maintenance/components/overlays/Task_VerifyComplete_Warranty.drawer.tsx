"use client"

import { Button, Card, DatePicker, Drawer, Form, DrawerProps, Image, App } from "antd"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { clientEnv } from "@/env"
import { useState } from "react"
import { Dayjs } from "dayjs"
import { SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import AlertCard from "@/components/AlertCard"

type Task_VerifyComplete_WarrantyDrawerProps = {
   task?: TaskDto
   onSubmit?: (warrantyDate?: string) => void
}
type Props = Omit<DrawerProps, "children"> &
   Task_VerifyComplete_WarrantyDrawerProps & {
      handleClose?: () => void
   }

function Task_VerifyComplete_WarrantyDrawer(props: Props) {
   const { message } = App.useApp()
   const [warrantyDate, setWarrantyDate] = useState<Dayjs | null>(null)

   function handleSubmit() {
      if (!warrantyDate) {
         message.error("Vui lòng chọn ngày bảo hành")
         return
      }
      props.onSubmit?.(warrantyDate?.toISOString())
      props.handleClose?.()
   }

   return (
      <Drawer
         title="Kiểm tra chữ ký"
         height="max-content"
         placement="bottom"
         footer={
            <Button size="large" block type="primary" onClick={handleSubmit}>
               Xác nhận thông tin
            </Button>
         }
         classNames={{
            footer: "p-layout",
         }}
         {...props}
      >
         <AlertCard text="Vui lòng kiểm tra chữ ký bên dưới" type="info" />
         <div className="mt-3 grid grid-cols-2 gap-3">
            {props.task?.imagesVerify.map((img) => (
               <Image
                  key={img}
                  src={clientEnv.BACKEND_URL + `/file-image/${props.task?.imagesVerify[0]}`}
                  alt="Chữ ký"
                  className="aspect-square h-max rounded-lg"
               />
            ))}
         </div>
         <section className="mt-3">
            <h3 className="mb-2 text-base font-medium text-gray-600">Biên lai bảo hành</h3>
            <div className="mb-3 grid grid-cols-4 gap-3">
               {props.task?.issues
                  .find((issue) => issue.typeError?.id === SendWarrantyTypeErrorId)
                  ?.imagesVerify.map((img) => (
                     <Image
                        key={img}
                        src={clientEnv.BACKEND_URL + `/file-image/${img}`}
                        alt="image"
                        className="aspect-square h-full rounded-lg"
                     />
                  ))}
            </div>
            <Form.Item rules={[{ required: true }]}>
               <DatePicker
                  className="w-full"
                  placeholder="Chọn ngày bảo hành xong"
                  size="large"
                  value={warrantyDate}
                  onChange={(date) => {
                     setWarrantyDate(date)
                  }}
               />
            </Form.Item>
         </section>
      </Drawer>
   )
}

export default Task_VerifyComplete_WarrantyDrawer
export type { Task_VerifyComplete_WarrantyDrawerProps }
