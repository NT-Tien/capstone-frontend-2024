import HeadStaff_Task_Update from "@/features/head-maintenance/api/task/update.api"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import useModalControls from "@/lib/hooks/useModalControls"
import { useMutation } from "@tanstack/react-query"
import { App, Button, DatePicker, Drawer, Form } from "antd"
import dayjs, { Dayjs } from "dayjs"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"

export type UpdateTaskFixDateDrawerRefType = {
   handleOpen: (task: TaskDto) => void
}

type Props = {
   refetchFn?: () => void
}

const UpdateTaskFixDateDrawer = forwardRef<UpdateTaskFixDateDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (task: TaskDto) => {
         setTask(task)
      },
      onClose: () => {
         setTask(null)
      },
   })
   const { message } = App.useApp()

   const mutate_update = useMutation({
      mutationFn: HeadStaff_Task_Update,
      onMutate: () => {
         message.loading({
            content: "Đang cập nhật ngày sửa chữa...",
            key: "updateTaskFixDate",
         })
      },
      onSettled: () => {
         message.destroy("updateTaskFixDate")
      },
      onError: (error) => {
         message.error({
            content: error.message,
            key: "updateTaskFixDate",
         })
      },
      onSuccess: () => {
         message.success({
            content: "Cập nhật ngày sửa chữa thành công",
            key: "updateTaskFixDate",
         })
      },
   })

   const [task, setTask] = useState<TaskDto | null>(null)
   const [fixerDate, setFixerDate] = useState<Dayjs | undefined>(undefined)

   useEffect(() => {
      if (task) {
         setFixerDate(task.fixerDate ? dayjs(task.fixerDate) : undefined)
      }
   }, [task])

   function handleSubmit() {
      if (!task || !fixerDate) return

      mutate_update.mutate(
         {
            id: task.id,
            payload: {
               fixerDate: fixerDate.toISOString(),
            },
         },
         {
            onSuccess: () => {
               handleClose()
               props.refetchFn?.()
            },
         },
      )
   }

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <>
         <Drawer open={open} onClose={handleClose} placement="bottom" height="max-content" title="Cập nhật thời gian">
            <DatePicker
               size="large"
               className="w-full"
               placeholder="Chọn ngày sửa chữa cho tác vụ"
               disabledDate={(current) => current && current < dayjs().startOf("day")}
               onChange={(date) => {
                  setFixerDate(date)
               }}
               value={fixerDate}
            />
            <Button
               size="large"
               type="primary"
               className="mt-3 w-full"
               disabled={!fixerDate}
               loading={mutate_update.isPending}
               onClick={handleSubmit}
            >
               Cập nhật
            </Button>
         </Drawer>
      </>
   )
})

export default UpdateTaskFixDateDrawer
