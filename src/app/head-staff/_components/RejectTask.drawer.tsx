import { ReactNode, useState } from "react"
import { App, Button, Card, Drawer, Form } from "antd"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import qk from "@/common/querykeys"
import { ProFormTextArea } from "@ant-design/pro-components"
import { FixRequestStatus } from "@/common/enum/issue-request-status.enum"
import { UploadOutlined } from "@ant-design/icons"

type FieldType = {
   rejectMsg: string
}

type Props = {
   children: (handleOpen: (id: string) => void) => ReactNode
   afterSuccess?: () => void
}

export default function RejectTaskDrawer({ children, afterSuccess }: Props) {
   const [open, setOpen] = useState(false)
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

   function handleOpen(id: string) {
      setOpen(true)
      setId(id)
   }

   function handleClose() {
      setOpen(false)
      setId(undefined)
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} title="Reject Report" placement="bottom" height="max-content">
            <Card className="mb-3">
               You are trying to reject this report. The Reporter will be notified of your decision.
            </Card>
            <Form<FieldType> form={form} onFinish={handleFinish}>
               <ProFormTextArea name="rejectMsg" label="Reason for Rejection" rules={[{ required: true }]} />
            </Form>
            <Button
               className="w-full"
               size="large"
               type="primary"
               onClick={() => form.submit()}
               danger
               icon={<UploadOutlined />}
            >
               Reject Request
            </Button>
         </Drawer>
      </>
   )
}
