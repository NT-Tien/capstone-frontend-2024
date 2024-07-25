"use client"

import React, { ReactNode, useState } from "react"
import { App, Button, Drawer, DrawerProps, Form, Radio } from "antd"
import { FixType } from "@/common/enum/fix-type.enum"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import HeadStaff_Task_OneById from "@/app/head-staff/_api/task/one-byId.api"
import { ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import HeadStaff_Issue_Create from "@/app/head-staff/_api/issue/create.api"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import useModalControls from "@/common/hooks/useModalControls"

type FieldType = {
   typeError: string
   description: string
   fixType: FixType
}

export default function CreateIssueDrawer(props: {
   children: (handleOpen: (requestId: string) => void) => ReactNode
   onSuccess?: () => void
   drawerProp?: DrawerProps
}) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (requestId: string) => {
         setId(requestId)
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

   const result = useQuery({
      queryKey: qk.issueRequests.byId(id ?? ""),
      queryFn: () => HeadStaff_Request_OneById({ id: id ?? "" }),
      enabled: !!id,
   })

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
         message.error("Tạo vấn đề thất bại")
      },
      onSuccess: async () => {
         message.success("Tạo vấn đề thành công")
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

   return (
      <>
         {props.children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            height="max-content"
            placement="bottom"
            title="Thông tin chi tiết"
            classNames={{
               body: "flex flex-col",
            }}
            {...props.drawerProp}
         >
            <Form<FieldType> form={form} onFinish={handleFinish} className="flex-grow" layout="vertical">
               <ProFormSelect
                  name="typeError"
                  label="Loại lỗi"
                  rules={[{ required: true }]}
                  options={device.data?.machineModel.typeErrors.map((error) => ({
                     label: error.name,
                     value: error.id,
                  }))}
                  showSearch
                  fieldProps={{
                     size: "large",
                  }}
               />
               <Form.Item label="Cách sửa" name="fixType" initialValue={FixType.REPLACE}>
                  <Radio.Group buttonStyle="solid" size="large" className="w-full">
                     {Object.values(FixType).map((fix) => (
                        <Radio.Button key={fix} value={fix} className="capitalize">
                           {fix}
                        </Radio.Button>
                     ))}
                  </Radio.Group>
               </Form.Item>
               <ProFormTextArea
                  name="description"
                  label="Mô tả"
                  rules={[{ required: true }]}
                  allowClear
                  fieldProps={{
                     showCount: true,
                     maxLength: 300,
                  }}
               />
            </Form>
            <Button className="w-full" type="primary" onClick={form.submit} size="large">
               Tạo vấn đề
            </Button>
         </Drawer>
      </>
   )
}
