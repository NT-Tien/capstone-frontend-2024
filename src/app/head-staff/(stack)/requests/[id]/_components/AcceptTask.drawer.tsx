import { ReactNode, useState } from "react"
import { App, Button, Card, Drawer, Form, Switch } from "antd"
import { ProFormDigit, ProFormText } from "@ant-design/pro-components"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import HeadStaff_Task_Create, { Request as CreateRequest } from "@/app/head-staff/_api/task/create.api"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import { UploadOutlined } from "@ant-design/icons"
import qk from "@/common/querykeys"
import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"

type FieldType = {
   name: string
   operator: number
   totalTime: number
}

export default function AcceptTaskDrawer({
   children,
}: {
   children: (handleOpen: (requestId: string) => void) => ReactNode
}) {
   const [open, setOpen] = useState(false)
   const [id, setId] = useState<undefined | string>()
   const [isPriority, setIsPriority] = useState(false)
   const [form] = Form.useForm()
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const mutate_acceptReport = useMutation({
      mutationFn: async (req: CreateRequest) => {
         const updateStatus = await HeadStaff_Request_UpdateStatus({
            id: req.request,
            payload: {
               status: IssueRequestStatus.APPROVED,
               checker_note: "",
            },
         })

         if (!updateStatus) throw new Error("")

         return await HeadStaff_Task_Create(req)
      },
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "loading",
            content: "Creating task...",
         })
      },
      onSuccess: async () => {
         message.success("Task created successfully")
         await queryClient.invalidateQueries({
            queryKey: qk.task.all(),
         })
      },
      onError: async (e) => {
         message.error("Failed to create task")
         if (!id) return
         mutate_undoApprove.mutate({
            id,
            payload: {
               status: IssueRequestStatus.PENDING,
               checker_note: "",
            },
         })
      },
      onSettled: () => {
         message.destroy("loading")
         form.resetFields()
      },
   })

   const mutate_undoApprove = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
   })

   function handleFinish(values: FieldType) {
      if (!id) return

      mutate_acceptReport.mutate(
         {
            name: values.name,
            priority: isPriority,
            operator: values.operator,
            request: id,
            totalTime: values.totalTime,
         },
         {
            onSuccess: () => {
               handleClose()
            },
         },
      )
   }

   function handleOpen(requestId: string) {
      setOpen(true)
      setId(requestId)
   }

   function handleClose() {
      setOpen(false)
      setId(undefined)
      if (form.isFieldsTouched()) {
         message.destroy("saved")
         message
            .info({
               content: "Your progress has been saved",
               key: "saved",
            })
            .then()
      }
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} title="Approve Request" placement="bottom" height="max-content">
            <Card className="mb-3">
               You are trying to approve this request. A new task will be created. You will be redirected to another
               page to select spare parts and assign people.
            </Card>
            <Form form={form} onFinish={handleFinish}>
               <ProFormText
                  name="name"
                  rules={[{ required: true }]}
                  label={"Task Name"}
                  fieldProps={{ size: "large" }}
               />
               <ProFormDigit
                  name="totalTime"
                  label="Time to Complete Request (minutes)"
                  rules={[{ required: true }]}
                  fieldProps={{ size: "large" }}
                  initialValue={0}
               />
               <div className="flex gap-6">
                  <ProFormDigit
                     name="operator"
                     label="Operator"
                     rules={[{ required: true }]}
                     fieldProps={{ size: "large" }}
                     initialValue={0}
                  />
                  <Form.Item label="How important is this issue?">
                     <Switch
                        checked={isPriority}
                        onChange={(e) => setIsPriority(e)}
                        checkedChildren="High Priority"
                        unCheckedChildren="Low Priority"
                        size="default"
                     />
                  </Form.Item>
               </div>
            </Form>
            <Button
               className="w-full"
               type="primary"
               size="large"
               loading={mutate_acceptReport.isPending}
               icon={<UploadOutlined />}
               onClick={() => form.submit()}
            >
               Submit
            </Button>
         </Drawer>
      </>
   )
}
