"use client"

import { Button, Drawer, DrawerProps, Image } from "antd"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { clientEnv } from "@/env"
import AlertCard from "@/components/AlertCard"

type Task_VerifyCompleteDrawerProps = {
   task?: TaskDto
   onSubmit?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   Task_VerifyCompleteDrawerProps & {
      handleClose?: () => void
   }

function Task_VerifyCompleteDrawer(props: Props) {
   function handleSubmit() {
      props.onSubmit?.()
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
         classNames={{ footer: "p-layout" }}
         {...props}
      >
         <AlertCard text="Vui lòng kiểm tra chữ ký bên dưới" type="info" />
         <div className="mt-3 grid grid-cols-2 gap-3">
            {props.task?.imagesVerify.map((img) => (
               <Image
                  key={img}
                  src={clientEnv.BACKEND_URL + `/file-image/${img}`}
                  alt="Chữ ký"
                  className="aspect-square h-max rounded-lg"
               />
            ))}
         </div>
      </Drawer>
   )
}

export default Task_VerifyCompleteDrawer
export type { Task_VerifyCompleteDrawerProps }
