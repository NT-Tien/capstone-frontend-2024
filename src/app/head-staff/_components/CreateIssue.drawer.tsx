"use client"

import { ReactNode, useState } from "react"
import { App, Button, Drawer, Form } from "antd"
import { FixType } from "@/common/enum/fix-type.enum"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import HeadStaff_Task_OneById from "@/app/head-staff/_api/task/one-byId.api"
import { ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import HeadStaff_Issue_Create from "@/app/head-staff/_api/issue/create.api"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"

type FieldType = {
   typeError: string
   description: string
   fixType: FixType
}

export default function CreateIssueDrawer(props: {
   children: (handleOpen: (requestId: string) => void) => ReactNode
   onSuccess?: () => void
}) {
   const [open, setOpen] = useState(false)
   const [id, setId] = useState<undefined | string>(undefined)
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const result = useQuery({
      queryKey: qk.issueRequests.byId(id ?? ""),
      queryFn: () => HeadStaff_Request_OneById({ id: id ?? "" }),
      enabled: !!id,
   })

   // TODO remove
   const device = useQuery({
      queryKey: qk.devices.one_byId(result.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: result.data?.device.id ?? "" }),
      enabled: result.isSuccess,
   })

   const mutate_createIssue = useMutation({
      mutationFn: HeadStaff_Issue_Create,
      onMutate: async () => {
         message.open({
            type: "loading",
            key: "creating-issue",
            content: "Creating issue...",
         })
      },
      onError: async () => {
         message.error("Failed to create issue")
      },
      onSuccess: async () => {
         message.success("Issue created")
         await queryClient.invalidateQueries({
            queryKey: qk.task.one_byId(id!),
         })
         form.resetFields()
         handleClose()
         props.onSuccess?.()
      },
      onSettled: () => {
         message.destroy("creating-issue")
      },
   })

   function handleFinish(values: FieldType) {
      if (!id || !result.isSuccess) return

      mutate_createIssue.mutate({
         request: result.data.id,
         fixType: values.fixType,
         description: values.description,
         typeError: values.typeError,
      })
   }

   function handleOpen(requestId: string) {
      setOpen(true)
      setId(requestId)
   }

   function handleClose() {
      setOpen(false)
      setId(undefined)
   }

   return (
      <>
         {props.children(handleOpen)}
         <Drawer open={open} onClose={handleClose} height="max-content" placement="bottom" title="Create Issue">
            <Form<FieldType> form={form} onFinish={handleFinish}>
            <ProFormSelect
                  name="typeError"
                  label="Type Error"
                  rules={[{ required: true }]}
                  options={device.data?.machineModel.typeErrors.map((error) => ({
                     label: error.name,
                     value: error.id,
                  }))}
                  showSearch
               />
               <ProFormSelect
                  name="fixType"
                  label="Fix Type"
                  rules={[{ required: true }]}
                  options={Object.values(FixType).map((fix) => ({
                     label: fix,
                     value: fix,
                  }))}
               />
               <ProFormTextArea name="description" label="Description" rules={[{ required: true }]} allowClear />
            </Form>
            <Button className="w-full" type="primary" onClick={form.submit} size="large">
               Create Issue
            </Button>
         </Drawer>
      </>
   )
}
