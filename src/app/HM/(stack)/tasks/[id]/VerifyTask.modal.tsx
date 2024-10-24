import { TaskDto } from "@/lib/domain/Task/Task.dto"
import useModalControls from "@/lib/hooks/useModalControls"
import { clientEnv } from "@/env"
import { Button, Drawer, Image } from "antd"
import { ReactNode, useState } from "react"

export default function VerifyTaskModal({
   children,
}: {
   children: (handleOpen: (task: TaskDto) => void) => ReactNode
}) {
   const [task, setTask] = useState<TaskDto | undefined>(undefined)

   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         setTask(undefined)
      },
      onOpen: (task: TaskDto) => {
         setTask(task)
      },
   })

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} placement="bottom" height="max-content" title="Xác nhận tác vụ">
            <section>
               <h2 className="mb-2 text-lg font-medium">Hình ảnh minh chứng</h2>
               <div className="flex items-center gap-2">
                  <Image
                     src={clientEnv.BACKEND_URL + `/file-image/${task?.imagesVerify?.[0]}`}
                     alt="image"
                     className="h-20 w-20 rounded-lg"
                  />
                  <div className="grid h-20 w-20 place-content-center rounded-lg border-2 border-dashed border-neutral-200"></div>
                  <div className="grid h-20 w-20 place-content-center rounded-lg border-2 border-dashed border-neutral-200"></div>
               </div>
            </section>
            <section className="mt-4">
               <h2 className="mb-2 text-lg font-medium">Video minh chứng</h2>
               {!!task?.videosVerify ? (
                  <video width="100%" height="240" controls>
                     <source src={clientEnv.BACKEND_URL + `/file-video/${task.videosVerify}`} type="video/mp4" />
                  </video>
               ) : (
                  <div className="grid h-20 w-full place-content-center rounded-lg bg-neutral-100">Không tìm thấy</div>
               )}
            </section>
            <section className="mt-layout">
               <Button type="primary" className="w-full" size="large">
                  Xác nhận
               </Button>
            </section>
         </Drawer>
      </>
   )
}
