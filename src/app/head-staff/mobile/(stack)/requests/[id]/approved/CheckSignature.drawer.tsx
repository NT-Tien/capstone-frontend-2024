import { TaskDto } from "@/common/dto/Task.dto"
import useModalControls from "@/common/hooks/useModalControls"
import { clientEnv } from "@/env"
import { Button, Card, Drawer, Image } from "antd"
import { forwardRef, useImperativeHandle, useState } from "react"

export type CheckSignatureDrawerRefType = {
   handleOpen: (task: TaskDto) => void
}

type Props = {
   children?: (handleOpen: (task: TaskDto) => void) => React.ReactNode
   onSubmit: () => void
}

const CheckSignatureDrawer = forwardRef<CheckSignatureDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (task: TaskDto) => {
         setTask(task)
      },
      onClose: () => {
        setTimeout(() => {
            setTask(null)
        }, 500)
      },
   })

   const [task, setTask] = useState<TaskDto | null>(null)

   function handleSubmit() {
        props.onSubmit()
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
            <div className="grid place-items-center">
               <Image src={clientEnv.BACKEND_URL + `/file-image/${task?.imagesVerify[0]}`} alt="Chữ ký" />
            </div>
            <Button size="large" className="mt-3 w-full" type="primary" onClick={handleSubmit}>
               Xác nhận
            </Button>
         </Drawer>
      </>
   )
})

export default CheckSignatureDrawer
