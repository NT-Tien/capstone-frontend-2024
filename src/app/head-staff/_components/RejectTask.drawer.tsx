import { ReactNode, useState } from "react"
import { App, Button, Card, Drawer, Form } from "antd"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import HeadStaff_Request_UpdateStatus from "@/features/head-maintenance/api/request/updateStatus.api"
import qk from "@/old/querykeys"
import { ProFormTextArea } from "@ant-design/pro-components"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { UploadOutlined } from "@ant-design/icons"
import useModalControls from "@/lib/hooks/useModalControls"

type FieldType = {
   rejectMsg: string
}

type Props = {
   children: (handleOpen: (id: string) => void) => ReactNode
   afterSuccess?: () => void
}

export default function RejectTaskDrawer({ children, afterSuccess }: Props) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (id: string) => {
         setId(id)
      },
      onClose: () => {
         setId(undefined)
         form.resetFields()
      },
   })

   const [id, setId] = useState<undefined | string>(undefined)
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const mutate_rejectRequest = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "rejecting-report",
            content: "Rejecting report...",
         })
      },
      onError: async (err) => {
         message.error("Failed to reject report")
      },
      onSuccess: async () => {
         message.success("Report rejected")
         await queryClient.invalidateQueries({
            queryKey: qk.issueRequests.byId(id!), // cannot be null (checked using button below)
         })
      },
      onSettled: () => {
         message.destroy("rejecting-report")
      },
   })

   function handleFinish(values: FieldType) {
      if (!id) return
      mutate_rejectRequest.mutate(
         {
            id,
            payload: {
               status: FixRequestStatus.REJECTED,
               checker_note: values.rejectMsg,
            },
         },
         {
            onSuccess: async () => {
               handleClose()
               afterSuccess?.()
            },
         },
      )
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} title="Không vấn đề" placement="bottom" height="max-content">
            <Card className="mb-3">Hãy ghi lý do hoặc thông tin về báo cáo này nếu không có vấn đề</Card>
            <Form<FieldType> form={form} onFinish={handleFinish}>
               <ProFormTextArea name="rejectMsg" label="Thông tin đính kèm" rules={[{ required: true }]} />
            </Form>
            <Button
               className="w-full"
               size="large"
               type="primary"
               onClick={() => form.submit()}
               danger
               icon={<UploadOutlined />}
            >
               Gửi
            </Button>
         </Drawer>
      </>
   )
}
