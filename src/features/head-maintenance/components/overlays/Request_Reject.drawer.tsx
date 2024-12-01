import AlertCard from "@/components/AlertCard"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { SendOutlined } from "@ant-design/icons"
import { DrawerProps } from "antd"
import Button from "antd/es/button"
import Drawer from "antd/es/drawer"
import Form from "antd/es/form"
import Input from "antd/es/input"
import { TextAreaRef } from "antd/es/input/TextArea"
import { useMemo, useRef } from "react"

type FieldType = {
   message: string
}

type Request_RejectDrawerProps = {
   request?: RequestDto
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> & Request_RejectDrawerProps

function Request_RejectDrawer(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const mutate_rejectRequest = head_maintenance_mutations.request.reject()

   const inputRef = useRef<TextAreaRef | null>(null)

   const canRejectRequest = useMemo(() => {
      return props.request?.tasks.every(
         (task) => task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED,
      )
   }, [props.request?.tasks])

   function handleFinish(values: FieldType) {
      if (!props.request) return
      mutate_rejectRequest.mutate(
         {
            id: props.request.id,
            payload: {
               checker_note: values.message,
            },
         },
         {
            onSuccess: props.onSuccess,
         },
      )
   }

   return (
      <Drawer
         title="Đóng yêu cầu"
         placement="bottom"
         height="max-content"
         classNames={{
            footer: "p-layout",
         }}
         footer={
            <Button
               type="primary"
               icon={<SendOutlined />}
               className="w-full"
               onClick={form.submit}
               size="large"
               danger
               disabled={!canRejectRequest}
               loading={mutate_rejectRequest.isPending}
            >
               Gửi
            </Button>
         }
         {...props}
      >
         <Form<FieldType> form={form} onFinish={handleFinish}>
            {!canRejectRequest && (
               <AlertCard
                  text="Bạn cần hoàn thành/hủy tất cả các tác vụ trước khi hủy yêu cầu"
                  type="error"
                  className="mb-layout"
               />
            )}
            <Form.Item<FieldType> name="message" label="Lý do hủy yêu cầu" rules={[{ required: true }]}>
               <Input.TextArea
                  ref={inputRef}
                  showCount
                  maxLength={200}
                  placeholder="Vui lòng nhập lý do đóng yêu cầu"
                  allowClear
                  autoFocus
                  disabled={!canRejectRequest}
               />
            </Form.Item>
         </Form>
      </Drawer>
   )
}

export default Request_RejectDrawer
export type { Request_RejectDrawerProps }
