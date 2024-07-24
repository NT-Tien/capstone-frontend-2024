import React, { ReactNode, useEffect, useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Button, Drawer, Form, Radio } from "antd"
import HeadStaff_Task_Create, { Request as CreateRequest } from "@/app/head-staff/_api/task/create.api"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import { ProFormDatePicker, ProFormDigit, ProFormText } from "@ant-design/pro-components"
import { PlusOutlined } from "@ant-design/icons"
import { Dayjs } from "dayjs"
import HeadStaff_Request_UpdateStatus, {
   Request as UpdateRequest,
} from "@/app/head-staff/_api/request/updateStatus.api"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"

type FieldType = {
   name: string
   operator: number
   fixerDate: Dayjs
   priority: boolean
}

export default function DesktopCreateTaskDrawer({
   children,
   afterSuccess,
}: {
   children: (handleOpen: (requestId: string, issueIds?: string[]) => void) => ReactNode
   afterSuccess?: () => void
}) {
   const { message } = App.useApp()

   const [open, setOpen] = useState(false)
   const [requestId, setRequestId] = useState<string | undefined>(undefined)
   const [issueIds, setIssueIds] = useState<string[]>([])

   const [form] = Form.useForm()
   const api = useQuery({
      queryKey: headstaff_qk.request.byId(requestId ?? ""),
      queryFn: () => HeadStaff_Request_OneById({ id: requestId ?? "" }),
      enabled: !!requestId,
   })

   const selectedIssues = useMemo(() => {
      return api.data?.issues.filter((issue) => issueIds.includes(issue.id)) ?? []
   }, [api.data, issueIds])

   const mutate_createTask = useMutation({
      mutationFn: async (req: { create: CreateRequest; update: UpdateRequest }) => {
         return await Promise.allSettled([
            HeadStaff_Task_Create(req.create),
            HeadStaff_Request_UpdateStatus(req.update),
         ])
      },
      onMutate: async () => {
         message.destroy("create-task")
         message.open({
            type: "loading",
            content: "Creating task...",
            key: "create-task",
         })
      },
      onError: async (error) => {
         message.error({
            content: "Failed to create task. See logs.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: "Task created successfully.",
         })
         handleClose()
         afterSuccess?.()
      },
      onSettled: () => {
         message.destroy("create-task")
      },
   })

   function handleOpen(requestId: string, issueIds?: string[]) {
      setOpen(true)
      setRequestId(requestId)
      setIssueIds(issueIds ?? [])
   }

   function handleClose() {
      setOpen(false)
      setRequestId(undefined)
      setIssueIds([])
      form.resetFields()
   }

   function handleFinish(values: FieldType) {
      if (!requestId) return

      const totalTime = selectedIssues.reduce((acc, issue) => acc + issue.typeError.duration, 0)

      mutate_createTask.mutate({
         create: {
            name: values.name,
            operator: values.operator,
            issueIDs: issueIds,
            request: requestId,
            priority: values.priority,
            totalTime: totalTime + totalTime * 0.1,
            fixerDate: values.fixerDate.toISOString(),
         },
         update: {
            id: requestId,
            payload: {
               status: FixRequestStatus.APPROVED,
               checker_note: "",
            },
         },
      })
   }

   useEffect(() => {
      form.setFieldsValue({
         name: `${api.data?.device.machineModel.name}-${api.data?.device.area.name}-${api.data?.device.positionX}-${api.data?.device.positionY}`,
      })
   }, [api.data, form, api.isSuccess])

   return (
      <>
         {children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title="Create Task"
            width={"500px"}
            classNames={{
               body: "flex flex-col",
            }}
         >
            <Form form={form} onFinish={handleFinish} className="mt-3 flex-grow" layout="vertical">
               <ProFormText
                  extra={
                     api.isSuccess && (
                        <Button
                           type="link"
                           icon={<PlusOutlined />}
                           onClick={() => {
                              form.setFieldsValue({
                                 name: `${api.data.device.machineModel.name}-${api.data.device.area.name}-${api.data.device.positionX}-${api.data.device.positionY}`,
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
               <div className="flex items-center justify-between gap-2">
                  <ProFormDigit
                     name="operator"
                     label="Operator"
                     rules={[{ required: true }]}
                     fieldProps={{ size: "large" }}
                     className="w-full"
                     initialValue={0}
                  />
                  <Form.Item label="Task Priority" name="priority" initialValue={false}>
                     <Radio.Group buttonStyle="solid" size="large" className="w-full">
                        <Radio.Button value={false}>Normal</Radio.Button>
                        <Radio.Button value={true}>Priority</Radio.Button>
                     </Radio.Group>
                  </Form.Item>
               </div>
               <ProFormDatePicker
                  name="fixerDate"
                  label="Fixer Date"
                  fieldProps={{
                     size: "large",
                     className: "w-full",
                  }}
                  rules={[{ required: true }]}
               />
            </Form>
            <Button icon={<PlusOutlined />} type="primary" size="large" onClick={() => form.submit()}>
               Create Task
            </Button>
         </Drawer>
      </>
   )
}
