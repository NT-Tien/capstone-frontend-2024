import { TaskDto } from "@/lib/domain/Task/Task.dto"
import useModalControls from "@/lib/hooks/useModalControls"
import { SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import { clientEnv } from "@/env"
import { App, Button, Card, DatePicker, Drawer, Form, Image } from "antd"
import { Dayjs } from "dayjs"
import { forwardRef, useImperativeHandle, useMemo, useState } from "react"

export type CheckSignatureDrawerRefType = {
   handleOpen: (task: TaskDto, isWarranty?: boolean) => void
}

type Props = {
   children?: (handleOpen: (task: TaskDto, isWarranty?: boolean) => void) => React.ReactNode
   onSubmit: (warrantyDate?: string) => void
}

const OldTask_VerifyCompleteDrawer = forwardRef<CheckSignatureDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (task: TaskDto, isWarranty?: boolean) => {
         setTask(task)
         setIsWarranty(isWarranty ?? false)
      },
      onClose: () => {
         setTimeout(() => {
            setTask(null)
         }, 500)
      },
   })
   const { message } = App.useApp()

   const [task, setTask] = useState<TaskDto | null>(null)
   const [isWarranty, setIsWarranty] = useState<boolean>(false)
   const [warrantyDate, setWarrantyDate] = useState<Dayjs | null>(null)

   function handleSubmit() {
      if (isWarranty && !warrantyDate) {
         message.error("Vui lòng chọn ngày bảo hành")
         return
      }
      props.onSubmit(warrantyDate?.toISOString())
      handleClose()
   }

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <>
         {props.children?.(handleOpen)}
         <Drawer title="Kiểm tra chữ ký" height="max-content" placement="bottom" open={open} onClose={handleClose}>
            <Card size="small" className="mb-3">
               <div className="grid place-items-center">Vui lòng kiểm tra chữ ký bên dưới</div>
            </Card>
            <Card size="small" className="grid place-items-center">
               <Image
                  src={clientEnv.BACKEND_URL + `/file-image/${task?.imagesVerify[0]}`}
                  alt="Chữ ký"
                  className="h-36"
               />
            </Card>
            {isWarranty && (
               <section className="mt-3">
                  <h3 className="mb-2 text-base font-medium text-gray-600">Biên lai bảo hành</h3>
                  <div className="mb-3 grid grid-cols-4 gap-3">
                     {task?.issues
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
            )}
            <Button size="large" className="mt-3 w-full" type="primary" onClick={handleSubmit}>
               Xác nhận
            </Button>
         </Drawer>
      </>
   )
})

export default OldTask_VerifyCompleteDrawer
