import useModalControls from "@/common/hooks/useModalControls"
import Button from "antd/es/button"
import Drawer from "antd/es/drawer"
import Form from "antd/es/form"
import Input from "antd/es/input"
import { TextAreaRef } from "antd/es/input/TextArea"
import { SendOutlined } from "@ant-design/icons"
import { forwardRef, ReactNode, useImperativeHandle, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import App from "antd/es/app"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"

const sampleRejectionReasons = ["Thiết bị chưa cắm điện", "Không đủ nhân lực để thực hiện"]

export type RejectRequestDrawerRefType = {
   handleOpen: (requestId: string) => void
}

type FieldType = {
   message: string
}

type Props = {
   children?: (handleOpen: (requestId: string) => void) => ReactNode
   refetchFn?: () => void
   onSuccess?: () => void
}

const RejectRequestDrawer = forwardRef<RejectRequestDrawerRefType, Props>(function Component(
   { children, ...props },
   ref,
) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (requestId: string) => {
         setRequestId(requestId)
         inputRef.current?.focus()
      },
      onClose: () => {
         setRequestId(undefined)
         form.resetFields()
      },
   })
   const [form] = Form.useForm<FieldType>()
   const inputRef = useRef<TextAreaRef | null>(null)
   const { message } = App.useApp()

   const [requestId, setRequestId] = useState<string | undefined>(undefined)

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
      if (!requestId) return
      mutate_rejectRequest.mutate(
         {
            id: requestId,
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
         <Drawer open={open} onClose={handleClose} title="Hủy yêu cầu" placement="bottom" height="max-content">
            <Form<FieldType> form={form} onFinish={handleFinish}>
               <Form.Item<FieldType> name="message" label="Lý do hủy yêu cầu" rules={[{ required: true }]}>
                  <Input.TextArea
                     ref={inputRef}
                     showCount
                     maxLength={200}
                     placeholder="Vui lòng nhập lý do hủy yêu cầu"
                     allowClear
                     autoFocus
                  />
               </Form.Item>
               <Form.Item noStyle className="mt-layout">
                  <Button
                     type="primary"
                     icon={<SendOutlined />}
                     htmlType="submit"
                     className="w-full"
                     size="large"
                     loading={mutate_rejectRequest.isPending}
                  >
                     Gửi
                  </Button>
               </Form.Item>
            </Form>
         </Drawer>
         {children?.(handleOpen)}
      </>
   )
})

export default RejectRequestDrawer
