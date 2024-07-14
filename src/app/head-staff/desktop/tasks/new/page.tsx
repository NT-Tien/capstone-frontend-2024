"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { useRouter } from "next/navigation"
import { useCreateTask } from "@/app/head-staff/_context/CreateTask.context"
import { App, Button, Card, Form, Switch } from "antd"
import { ProFormDigit, ProFormText } from "@ant-design/pro-components"
import { PlusOutlined } from "@ant-design/icons"
import React, { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import HeadStaff_Task_Create from "@/app/head-staff/_api/task/create.api"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"

type FieldType = {
   name: string
   operator: number
}

export default function Page() {
   const { requestId, issueIds } = useCreateTask()
   const router = useRouter()

   if (!requestId) {
      router.push("/head-staff/desktop/requests")
      return
   }

   return <NewTaskPage requestId={requestId} />
}

type Props = {
   requestId: string
}

function NewTaskPage({ requestId }: Props) {
   const router = useRouter()
   const { message } = App.useApp()

   const [isPriority, setIsPriority] = useState(false)

   const [form] = Form.useForm()
   const api = useQuery({
      queryKey: headstaff_qk.request.byId(requestId ?? ""),
      queryFn: () => HeadStaff_Request_OneById({ id: requestId ?? "" }),
      enabled: !!requestId,
   })

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
      },
      onSettled: () => {
         message.destroy("create-task")
      },
   })

   function handleFinish(values: FieldType) {}

   return (
      <PageContainer
         header={{
            title: "Create a new Task",
            breadcrumb: {
               items: [
                  {
                     title: "Dashboard",
                     onClick: () => router.push("/head-staff/desktop/dashboard"),
                  },
                  {
                     title: "Tasks",
                     onClick: () => router.push("/head-staff/desktop/tasks"),
                  },
                  {
                     title: "New",
                  },
               ],
            },
         }}
         content={
            <div>
               <div className="pb-3">Please fill in the form to create a new Task</div>
               <Card>
                  <div className="grid grid-cols-2 gap-6">
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
                              />
                           </Form.Item>
                        </div>
                     </Form>
                     <section>
                        <Card title="Original Request"></Card>
                     </section>
                  </div>
               </Card>
            </div>
         }
      ></PageContainer>
   )
}
