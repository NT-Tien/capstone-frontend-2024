import { ReactNode, useMemo, useState } from "react"
import { App, Button, Card, Drawer, Form, Switch } from "antd"
import { ProFormDigit, ProFormText } from "@ant-design/pro-components"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import HeadStaff_Task_Create, { Request as CreateRequest } from "@/app/head-staff/_api/task/create.api"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import { PlusOutlined, UploadOutlined } from "@ant-design/icons"
import qk from "@/common/querykeys"
import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"
import { useRouter } from "next/navigation"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import { TaskDto } from "@/common/dto/Task.dto"

type FieldType = {
   name: string
   operator: number
}

export default function AcceptTaskDrawer({
   children,
   onSuccess,
}: {
   children: (handleOpen: (requestId: string) => void) => ReactNode
   onSuccess?: (task: TaskDto) => void
}) {
   const [open, setOpen] = useState(false)
   const [id, setId] = useState<undefined | string>()
   const [isPriority, setIsPriority] = useState(false)
   const [form] = Form.useForm()
   const { message } = App.useApp()
   const queryClient = useQueryClient()
   const router = useRouter()

   const request = useQuery({
      queryKey: qk.issueRequests.byId(id ?? ""),
      queryFn: () => HeadStaff_Request_OneById({ id: id ?? "" }),
      enabled: !!id,
   })

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
         router.push("/head-staff/tasks")
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

   const totalTime = useMemo(() => {
      if (!request.isSuccess) return null

      return request.data.issues.reduce((acc, curr) => acc + curr.typeError.duration, 0)
   }, [request.isSuccess, request.data])

   function handleFinish(values: FieldType) {
      if (!id || !totalTime) return

      mutate_acceptReport.mutate(
         {
            name: values.name,
            priority: isPriority,
            operator: values.operator,
            request: id,
            totalTime: totalTime,
         },
         {
            onSuccess: (response) => {
               handleClose()
               onSuccess?.(response)
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
                  extra={
                     request.isSuccess && (
                        <Button
                           type="link"
                           icon={<PlusOutlined />}
                           onClick={() => {
                              form.setFieldsValue({
                                 name: `${request.data.device.machineModel.name}-${request.data.device.area.name}-${request.data.device.positionX}-${request.data.device.positionY}`,
                              })
                           }}
                        >
                           Generate Task Name
                        </Button>
                     )
                  }
                  allowClear
                  name="name"
                  rules={[{ required: true }]}
                  label={"Task Name"}
                  fieldProps={{ size: "large" }}
               />
               <div className="flex gap-6">
                  <ProFormDigit
                     name="operator"
                     label="Operator"
                     rules={[{ required: true }]}
                     fieldProps={{ size: "large" }}
                     initialValue={0}
                  />
                  <Form.Item label="Task Priority">
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
            <div>
               <div className="mb-2 flex justify-end gap-2">
                  <span className="font-semibold text-gray-500">Estimated time to complete:</span>
                  <span>{totalTime ?? "-"} minutes</span>
               </div>
               <Button
                  className="w-full"
                  type="primary"
                  size="large"
                  loading={mutate_acceptReport.isPending}
                  icon={<UploadOutlined />}
                  onClick={() => form.submit()}
               >
                  Approve Request
               </Button>
            </div>
         </Drawer>
      </>
   )
}
