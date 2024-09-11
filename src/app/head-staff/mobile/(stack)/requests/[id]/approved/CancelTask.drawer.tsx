import { TaskDto } from "@/common/dto/Task.dto"
import useModalControls from "@/common/hooks/useModalControls"
import { App, Button, Checkbox, Drawer, DrawerProps, Switch } from "antd"
import { forwardRef, ReactNode, useImperativeHandle, useMemo, useState } from "react"
import { DeleteOutlined } from "@ant-design/icons"
import AlertCard from "@/components/AlertCard"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { useMutation } from "@tanstack/react-query"
import HeadStaff_Task_Update from "@/app/head-staff/_api/task/update.api"

type HandleOpen = {
   task: TaskDto
}

type CancelTaskDrawerRefType = {
   handleOpen: (props: HandleOpen) => void
}

type Props = {
   children?: (handleOpen: (props: HandleOpen) => void) => ReactNode
   drawerProps?: Omit<DrawerProps, "children">
   refetchFn?: () => void
}

const CancelTaskDrawer = forwardRef<CancelTaskDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         setTask(null)
         setChecked(false)
      },
      onOpen: (props: HandleOpen) => {
         setTask(props.task)
      },
   })
   const { message } = App.useApp()

   const [task, setTask] = useState<TaskDto | null>(null)
   const [checked, setChecked] = useState(false)

   const mutate_cancelTask = useMutation({
      mutationFn: HeadStaff_Task_Update,
      onSuccess: () => {
         message.success("Hủy tác vụ thành công")
      },
      onError: (e) => {
         console.error(e)
         message.error("Hủy tác vụ thất bại")
      },
      onMutate: async () => {
         message.loading({
            content: "Đang hủy tác vụ...",
            key: "cancel-task",
         })
      },
      onSettled: () => {
         message.destroy("cancel-task")
      },
   })

   function handleSubmit() {
      if (!task) return
      mutate_cancelTask.mutate(
         {
            id: task.id,
            payload: {
               status: TaskStatus.CANCELLED,
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

   const canCancelTask = useMemo(() => {
      if (!task) return false
      const set = new Set([TaskStatus.AWAITING_SPARE_SPART, TaskStatus.ASSIGNED, TaskStatus.AWAITING_FIXER])
      return set.has(task?.status)
   }, [task])

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <>
         {props.children?.(handleOpen)}
         <Drawer
            title="Hủy tác vụ"
            open={open}
            onClose={handleClose}
            placement="bottom"
            height="max-content"
            classNames={{
               footer: "p-layout",
            }}
            footer={
               <Button
                  size="large"
                  type="primary"
                  className="w-full"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!canCancelTask || !checked}
                  onClick={handleSubmit}
                  loading={mutate_cancelTask.isPending}
               >
                  Hủy tác vụ
               </Button>
            }
            {...props.drawerProps}
         >
            <AlertCard text="Bạn có chắc chắn muốn hủy tác vụ này?" />
            <div className="mt-layout flex items-center gap-2">
               <Checkbox id="cancel-check" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
               <label htmlFor="cancel-check">Tôi muốn hủy tác vụ này</label>
            </div>
         </Drawer>
      </>
   )
})

export default CancelTaskDrawer
export type { CancelTaskDrawerRefType }
