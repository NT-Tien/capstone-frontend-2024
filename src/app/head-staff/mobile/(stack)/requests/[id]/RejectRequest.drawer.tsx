import useModalControls from "@/common/hooks/useModalControls"
import Button from "antd/es/button"
import Drawer from "antd/es/drawer"
import Form from "antd/es/form"
import Input from "antd/es/input"
import { TextAreaRef } from "antd/es/input/TextArea"
import { SendOutlined } from "@ant-design/icons"
import { forwardRef, ReactNode, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import App from "antd/es/app"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { TaskStatus } from "@/common/enum/task-status.enum"
import AlertCard from "@/components/AlertCard"

const sampleRejectionReasons = ["Thiết bị chưa cắm điện", "Không đủ nhân lực để thực hiện"]

type HandleOpen = {
   request: FixRequestDto
}

type RejectRequestDrawerRefType = {
   handleOpen: (props: HandleOpen) => void
}

type FieldType = {
   message: string
}

type Props = {
   children?: (handleOpen: (props: HandleOpen) => void) => ReactNode
   refetchFn?: () => void
   onSuccess?: () => void
}

const RejectRequestDrawer = forwardRef<RejectRequestDrawerRefType, Props>(function Component(
   { children, ...props },
   ref,
) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (props: HandleOpen) => {
         setRequest(props.request)
         inputRef.current?.focus()
      },
      onClose: () => {
         setTimeout(() => {
            setRequest(undefined)
            form.resetFields()
         }, 500)
      },
   })
   const [form] = Form.useForm<FieldType>()
   const inputRef = useRef<TextAreaRef | null>(null)
   const { message } = App.useApp()

   const [request, setRequest] = useState<FixRequestDto | undefined>(undefined)

   const canRejectRequest = useMemo(() => {
      return request?.tasks.every(
         (task) => task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED,
      )
   }, [request?.tasks])

   const mutate_rejectRequest = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
      onMutate: async () => {
         message.destroy("rejecting-request")
         message.open({
            content: "Đang hủy yêu cầu...",
            key: "rejecting-request",
            type: "loading",
         })
      },
      onError: async () => {
         message.error("Hủy yêu cầu thất bại. Vui lòng thử lại.")
      },
      onSuccess: async () => {
         message.success("Hủy yêu cầu thành công")
      },
      onSettled: () => {
         message.destroy("rejecting-request")
      },
   })

   function handleFinish(values: FieldType) {
      if (!request) return
      mutate_rejectRequest.mutate(
         {
            id: request.id,
            payload: {
               checker_note: values.message,
               status: FixRequestStatus.REJECTED,
            },
         },
         {
            onSuccess: async () => {
               handleClose()
               setTimeout(() => {
                  props.refetchFn?.()
                  props.onSuccess?.()
               }, 500)
            },
         },
      )
   }

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <>
         <Drawer
            open={open}
            onClose={handleClose}
            title="Hủy yêu cầu"
            placement="bottom"
            height="max-content"
            classNames={{
               footer: "p-layout",
            }}
            footer={
               <Button
                  type="primary"
                  icon={<SendOutlined />}
                  htmlType="submit"
                  className="w-full"
                  size="large"
                  danger
                  disabled={!canRejectRequest}
                  loading={mutate_rejectRequest.isPending}
               >
                  Gửi
               </Button>
            }
         >
            <Form<FieldType> form={form} onFinish={handleFinish}>
               {!canRejectRequest && (
                  <AlertCard text="Bạn cần hoàn thành/hủy tất cả các tác vụ trước khi hủy yêu cầu" type="error" className="mb-layout" />
               )}
               <Form.Item<FieldType> name="message" label="Lý do hủy yêu cầu" rules={[{ required: true }]}>
                  <Input.TextArea
                     ref={inputRef}
                     showCount
                     maxLength={200}
                     placeholder="Vui lòng nhập lý do hủy yêu cầu"
                     allowClear
                     autoFocus
                     disabled={!canRejectRequest}
                  />
               </Form.Item>
               <Form.Item noStyle className="mt-layout"></Form.Item>
            </Form>
         </Drawer>
         {children?.(handleOpen)}
      </>
   )
})

export default RejectRequestDrawer
export type { RejectRequestDrawerRefType }
