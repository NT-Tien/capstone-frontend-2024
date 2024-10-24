import { TaskDto } from "@/lib/domain/Task/Task.dto"
import useModalControls from "@/lib/hooks/useModalControls"
import { App, Button, Checkbox, Drawer, DrawerProps, Switch } from "antd"
import { forwardRef, ReactNode, useImperativeHandle, useMemo, useState } from "react"
import { DeleteOutlined } from "@ant-design/icons"
import AlertCard from "@/components/AlertCard"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { useMutation } from "@tanstack/react-query"
import HeadStaff_Task_Update from "@/features/head-maintenance/api/task/update.api"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"

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

const Task_CancelDrawer = forwardRef<CancelTaskDrawerRefType, Props>(function Component(props, ref) {
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

   const mutate_cancelTask = head_maintenance_mutations.task.cancel()

   function handleSubmit() {
      if (!task) return
      mutate_cancelTask.mutate(
         {
            id: task.id,
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

export default Task_CancelDrawer
export type { CancelTaskDrawerRefType }
