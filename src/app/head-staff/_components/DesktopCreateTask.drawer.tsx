import React, { Key, ReactNode, useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { App, Avatar, Button, Card, Drawer, Form, Switch, Tag } from "antd"
import HeadStaff_Task_Create from "@/app/head-staff/_api/task/create.api"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import ProList from "@ant-design/pro-list/lib"
import { FixType } from "@/common/enum/fix-type.enum"
import { ProFormDigit, ProFormText } from "@ant-design/pro-components"
import { PlusOutlined } from "@ant-design/icons"

const fixTypeColors = {
   [FixType.REPAIR]: "red",
   [FixType.REPLACE]: "blue",
}

type FieldType = {
   name: string
   operator: number
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
   const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([])
   const [isPriority, setIsPriority] = useState(false)

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
      mutationFn: HeadStaff_Task_Create,
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
   }

   function handleFinish(values: FieldType) {}

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} title="Create Task" width={"500px"}>
            <Card>
               <ProList<FixRequestIssueDto>
                  dataSource={selectedIssues}
                  rowKey="id"
                  headerTitle={
                     <div className="mt-0 flex items-center gap-2">
                        <span>Selected Issues</span>
                        <span className="text-xs font-normal text-gray-500">
                           {issueIds.length ?? "-"} issue{issueIds.length !== 1 && "s"} selected
                        </span>
                     </div>
                  }
                  loading={api.isPending}
                  expandable={{ expandedRowKeys, onExpandedRowsChange: setExpandedRowKeys as any }}
                  rowClassName="w-full"
                  className="list-no-padding"
                  metas={{
                     title: {
                        dataIndex: "typeError",
                        render: (_, e) => (
                           <div className="flex w-full items-center gap-2">
                              <h5>{e.typeError.name}</h5>
                              <Tag color={fixTypeColors[e.fixType]}>{e.fixType}</Tag>
                           </div>
                        ),
                     },
                     actions: {
                        render: (_, e) => (
                           <div>
                              {e.typeError.duration} minute{e.typeError.duration !== 1 && "s"}
                           </div>
                        ),
                     },
                     description: {
                        render: (_, e) => e.description,
                     },
                  }}
               />
            </Card>
            <Form form={form} onFinish={handleFinish} className="mt-3" layout="vertical">
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
         </Drawer>
      </>
   )
}
