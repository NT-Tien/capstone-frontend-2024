import Card from "antd/es/card"
import { useSimulationStore } from "@/app/simulation/(layout)/main-flow/store-provider"
import admin_queries from "@/features/admin/queries"
import AuthTokens from "@/lib/constants/AuthTokens"
import { useMemo, useState } from "react"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { Checkbox, Dropdown, List, Space, Tag } from "antd"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import Button from "antd/es/button"
import { DeleteOutlined, DownOutlined } from "@ant-design/icons"
import { ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import simulation_mutations from "@/features/simulation/mutations"
import dayjs from "dayjs"

function WarrantyTaskListSection() {
   const store = useSimulationStore((store) => store)

   const [selected_sendTasks, setSelected_sendTasks] = useState<{ [key: string]: TaskDto }>({})
   const [selected_receiveTasks, setSelected_receiveTasks] = useState<{ [key: string]: TaskDto }>({})

   const api_requests = admin_queries.request.manyByIds({
      ids: store.idLists_warrantyRequest,
      token: AuthTokens.Admin,
   })

   const api_tasks_send = useMemo(() => {
      const result: TaskDto[] = []
      if (!api_requests.data) return result
      for (const req of api_requests.data) {
         if (req.tasks) {
            const tasks = req.tasks.filter((task) =>
               task.issues.find((i) => i.typeError.id === SendWarrantyTypeErrorId),
            )
            result.push(...tasks)
         }
      }
      return result
   }, [api_requests.data])

   const api_tasks_receive = useMemo(() => {
      const result: TaskDto[] = []
      if (!api_requests.data) return result
      for (const req of api_requests.data) {
         if (req.tasks) {
            const tasks = req.tasks.filter((task) =>
               task.issues.find((i) => i.typeError.id === ReceiveWarrantyTypeErrorId),
            )
            result.push(...tasks)
         }
      }
      return result
   }, [api_requests.data])

   const mutate_taskAssignFixer = simulation_mutations.task.assignFixer()
   const mutate_taskStart = simulation_mutations.task.start()
   const mutate_taskFinish = simulation_mutations.task.finish()
   const mutate_taskHeadMaintenanceConfirm = simulation_mutations.task.headMaintenanceConfirm()
   const mutate_taskVerifySendWarrantyComplete = simulation_mutations.task.verifyWarrantySendComplete()
   const mutate_createReceiveWarrantyTasks = simulation_mutations.request.createReceiveWarrantyTasks()

   return (
      <div className="grid grid-cols-2 gap-3">
         <div>
            <Card
               title={
                  <div className="flex items-center gap-2">
                     {api_requests.isSuccess && api_requests.data.length > 0 && api_tasks_send && (
                        <div>
                           <Checkbox
                              checked={Object.keys(selected_sendTasks).length === api_tasks_send.length}
                              onChange={(e) => {
                                 if (e.target.checked) {
                                    setSelected_sendTasks(
                                       api_tasks_send.reduce((acc, item) => {
                                          acc[item.id] = item
                                          return acc
                                       }, {} as any),
                                    )
                                 } else {
                                    setSelected_sendTasks({})
                                 }
                              }}
                           />
                           <Dropdown
                              menu={{
                                 items: [
                                    {
                                       label: "Chọn tất cả Chưa phân công",
                                       key: "send-all-unassigned",
                                       onClick: () => {
                                          setSelected_sendTasks(
                                             api_tasks_send.reduce((acc, item) => {
                                                if (item.status === TaskStatus.AWAITING_FIXER) {
                                                   acc[item.id] = item
                                                }
                                                return acc
                                             }, {} as any),
                                          )
                                       },
                                    },
                                    {
                                       label: "Chọn tất cả Đã phân công",
                                       key: "send-all-assigned",
                                       onClick: () => {
                                          setSelected_sendTasks(
                                             api_tasks_send.reduce((acc, item) => {
                                                if (item.status === TaskStatus.ASSIGNED) {
                                                   acc[item.id] = item
                                                }
                                                return acc
                                             }, {} as any),
                                          )
                                       },
                                    },
                                    {
                                       label: "Chọn tất cả Chờ kiểm tra",
                                       key: "send-all-awaiting-verify",
                                       onClick: () => {
                                          setSelected_sendTasks(
                                             api_tasks_send.reduce((acc, item) => {
                                                if (item.status === TaskStatus.HEAD_STAFF_CONFIRM) {
                                                   acc[item.id] = item
                                                }
                                                return acc
                                             }, {} as any),
                                          )
                                       },
                                    },
                                 ],
                              }}
                           >
                              <Button size="small" type="text" icon={<DownOutlined />} />
                           </Dropdown>
                        </div>
                     )}
                     <h1>Tác vụ đem máy bảo hành</h1>
                  </div>
               }
               extra={
                  <div>
                     {Object.keys(selected_sendTasks).length > 0 && (
                        <div className="flex items-center gap-3">
                           <div>Đã chọn {Object.keys(selected_sendTasks).length} tác vụ</div>
                           <Button
                              danger
                              icon={<DeleteOutlined />}
                              type="primary"
                              onClick={() => setSelected_sendTasks({})}
                           />
                        </div>
                     )}
                  </div>
               }
            >
               <List
                  dataSource={api_tasks_send}
                  className="max-h-96 overflow-y-auto"
                  renderItem={(item) => {
                     return (
                        <List.Item
                           onClick={() => {
                              setSelected_sendTasks((prev) => {
                                 if (prev[item.id]) {
                                    const { [item.id]: _, ...rest } = prev
                                    return rest
                                 }
                                 return { ...prev, [item.id]: item }
                              })
                           }}
                        >
                           <List.Item.Meta
                              avatar={<Checkbox checked={!!selected_sendTasks[item.id]} />}
                              title={item.name}
                              description={
                                 item.fixer
                                    ? `${item.fixer.username} • ${dayjs(item.fixerDate).format("DD/MM/YYYY")}`
                                    : ""
                              }
                           />
                           <Tag color={TaskStatusTagMapper[item.status].colorInverse}>
                              {TaskStatusTagMapper[item.status].text}
                           </Tag>
                        </List.Item>
                     )
                  }}
               />
            </Card>
            <Space.Compact direction="vertical" className="mt-layout w-full">
               <Button
                  block
                  type="default"
                  onClick={() => {
                     mutate_taskAssignFixer.mutate(
                        {
                           tasks: Object.values(selected_sendTasks),
                        },
                        {
                           onSettled: async () => {
                              setSelected_sendTasks({})
                              await api_requests.refetch()
                           },
                        },
                     )
                  }}
               >
                  Phân công tác vụ
               </Button>
               <Button
                  block
                  type="default"
                  onClick={() => {
                     mutate_taskStart.mutate(
                        {
                           tasks: Object.values(selected_sendTasks),
                        },
                        {
                           onSettled: async () => {
                              setSelected_sendTasks({})
                              await api_requests.refetch()
                           },
                        },
                     )
                  }}
               >
                  Bắt đầu tác vụ
               </Button>
               <Button
                  block
                  type="default"
                  onClick={() => {
                     mutate_taskFinish.mutate(
                        {
                           tasks: Object.values(selected_sendTasks),
                        },
                        {
                           onSettled: async () => {
                              setSelected_sendTasks({})
                              await api_requests.refetch()
                           },
                        },
                     )
                  }}
               >
                  Hoàn thành tác vụ
               </Button>
               <Button
                  block
                  type="default"
                  onClick={async () => {
                     await mutate_taskVerifySendWarrantyComplete.mutateAsync({
                        tasks: Object.values(selected_sendTasks),
                     })

                     const requestIds = new Set(Object.values(selected_sendTasks).map((task) => task.request.id))
                     const requests = api_requests.data?.filter((req) => requestIds.has(req.id))

                     await mutate_createReceiveWarrantyTasks.mutateAsync(
                        {
                           requests: requests ?? [],
                        },
                        {
                           onSettled: async () => {
                              await api_requests.refetch()
                              setSelected_sendTasks({})
                           },
                        },
                     )
                  }}
               >
                  Kiểm tra tác vụ & Cập nhật thời gian
               </Button>
            </Space.Compact>
         </div>
         <div>
            <Card
               title={
                  <div className="flex items-center gap-2">
                     {api_requests.isSuccess && api_requests.data.length > 0 && api_tasks_receive && (
                        <div>
                           <Checkbox
                              checked={Object.keys(selected_receiveTasks).length === api_tasks_receive.length}
                              onChange={(e) => {
                                 if (e.target.checked) {
                                    setSelected_receiveTasks(
                                       api_tasks_receive.reduce((acc, item) => {
                                          acc[item.id] = item
                                          return acc
                                       }, {} as any),
                                    )
                                 } else {
                                    setSelected_receiveTasks({})
                                 }
                              }}
                           />
                           <Dropdown
                              menu={{
                                 items: [
                                    {
                                       label: "Chọn tất cả Chưa phân công",
                                       key: "send-all-unassigned",
                                       onClick: () => {
                                          setSelected_receiveTasks(
                                             api_tasks_receive.reduce((acc, item) => {
                                                if (item.status === TaskStatus.AWAITING_FIXER) {
                                                   acc[item.id] = item
                                                }
                                                return acc
                                             }, {} as any),
                                          )
                                       },
                                    },
                                    {
                                       label: "Chọn tất cả Đã phân công",
                                       key: "send-all-assigned",
                                       onClick: () => {
                                          setSelected_receiveTasks(
                                             api_tasks_receive.reduce((acc, item) => {
                                                if (item.status === TaskStatus.ASSIGNED) {
                                                   acc[item.id] = item
                                                }
                                                return acc
                                             }, {} as any),
                                          )
                                       },
                                    },
                                    {
                                       label: "Chọn tất cả Chờ kiểm tra",
                                       key: "send-all-awaiting-verify",
                                       onClick: () => {
                                          setSelected_receiveTasks(
                                             api_tasks_receive.reduce((acc, item) => {
                                                if (item.status === TaskStatus.HEAD_STAFF_CONFIRM) {
                                                   acc[item.id] = item
                                                }
                                                return acc
                                             }, {} as any),
                                          )
                                       },
                                    },
                                 ],
                              }}
                           >
                              <Button size="small" type="text" icon={<DownOutlined />} />
                           </Dropdown>
                        </div>
                     )}
                     <h1>Tác vụ lắp máy đã bảo hành</h1>
                  </div>
               }
               extra={
                  <div>
                     {Object.keys(selected_receiveTasks).length > 0 && (
                        <div className="flex items-center gap-3">
                           <div>Đã chọn {Object.keys(selected_receiveTasks).length} tác vụ</div>
                           <Button
                              danger
                              icon={<DeleteOutlined />}
                              type="primary"
                              onClick={() => setSelected_receiveTasks({})}
                           />
                        </div>
                     )}
                  </div>
               }
            >
               <List
                  dataSource={api_tasks_receive}
                  className="max-h-96 overflow-y-auto"
                  renderItem={(item) => {
                     return (
                        <List.Item
                           onClick={() => {
                              setSelected_receiveTasks((prev) => {
                                 if (prev[item.id]) {
                                    const { [item.id]: _, ...rest } = prev
                                    return rest
                                 }
                                 return { ...prev, [item.id]: item }
                              })
                           }}
                        >
                           <List.Item.Meta
                              avatar={<Checkbox checked={!!selected_receiveTasks[item.id]} />}
                              title={item.name}
                              description={
                                 item.fixer
                                    ? `${item.fixer.username} • ${dayjs(item.fixerDate).format("DD/MM/YYYY")}`
                                    : ""
                              }
                           />
                           <Tag color={TaskStatusTagMapper[item.status].colorInverse}>
                              {TaskStatusTagMapper[item.status].text}
                           </Tag>
                        </List.Item>
                     )
                  }}
               />
            </Card>
            <Space.Compact direction="vertical" className="mt-layout w-full">
               <Button
                  block
                  type="default"
                  onClick={() => {
                     mutate_taskAssignFixer.mutate(
                        {
                           tasks: Object.values(selected_receiveTasks),
                        },
                        {
                           onSettled: async () => {
                              setSelected_receiveTasks({})
                              await api_requests.refetch()
                           },
                        },
                     )
                  }}
               >
                  Phân công tác vụ
               </Button>
               <Button
                  block
                  type="default"
                  onClick={() => {
                     mutate_taskStart.mutate(
                        {
                           tasks: Object.values(selected_receiveTasks),
                        },
                        {
                           onSettled: async () => {
                              setSelected_receiveTasks({})
                              await api_requests.refetch()
                           },
                        },
                     )
                  }}
               >
                  Bắt đầu tác vụ
               </Button>
               <Button
                  block
                  type="default"
                  onClick={() => {
                     mutate_taskFinish.mutate(
                        {
                           tasks: Object.values(selected_receiveTasks),
                        },
                        {
                           onSettled: async () => {
                              setSelected_receiveTasks({})
                              await api_requests.refetch()
                           },
                        },
                     )
                  }}
               >
                  Hoàn thành tác vụ
               </Button>
               <Button
                  block
                  type="default"
                  onClick={async () => {
                     await mutate_taskHeadMaintenanceConfirm.mutateAsync(
                        {
                           tasks: Object.values(selected_receiveTasks),
                        },
                        {
                           onSettled: async () => {
                              setSelected_receiveTasks({})
                              await api_requests.refetch()
                           },
                        },
                     )
                  }}
               >
                  Kiểm tra tác vụ
               </Button>
            </Space.Compact>
         </div>
      </div>
   )
}

export default WarrantyTaskListSection
