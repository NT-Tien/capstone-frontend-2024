import admin_queries from "@/features/admin/queries"
import AuthTokens from "@/lib/constants/AuthTokens"
import { useSimulationStore } from "@/app/simulation/(layout)/main-flow/store-provider"
import { useMemo, useState } from "react"
import { Checkbox, Dropdown, List, Space, Tag } from "antd"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import Button from "antd/es/button"
import { DeleteOutlined, DownOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import Card from "antd/es/card"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import simulation_mutations from "@/features/simulation/mutations"

function FixTaskListSection() {
   const store = useSimulationStore((state) => state)

   const [selected_tasks, setSelected_tasks] = useState<{ [key: string]: TaskDto }>({})

   const api_requests = admin_queries.request.manyByIds({
      ids: store.idLists_fixRequest,
      token: AuthTokens.Admin,
   })

   const api_tasks = useMemo(() => {
      return api_requests.data?.flatMap((request) => request.tasks ?? [])
   }, [api_requests.data])

   const mutate_taskAssignFixer = simulation_mutations.task.assignFixer()
   const mutate_taskStart = simulation_mutations.task.start()
   const mutate_taskFinish = simulation_mutations.task.finish()
   const mutate_taskHeadMaintenanceConfirm = simulation_mutations.task.headMaintenanceConfirm()
   const mutate_taskConfirmReceipt = simulation_mutations.task.confirmReceipt()

   return (
      <div>
         <Card
            title={
               <div className="flex items-center gap-2">
                  {api_requests.isSuccess && api_requests.data.length > 0 && api_tasks && (
                     <div>
                        <Checkbox
                           checked={Object.keys(selected_tasks).length === api_tasks.length}
                           onChange={(e) => {
                              if (e.target.checked) {
                                 setSelected_tasks(
                                    api_tasks.reduce((acc, item) => {
                                       acc[item.id] = item
                                       return acc
                                    }, {} as any),
                                 )
                              } else {
                                 setSelected_tasks({})
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
                                       setSelected_tasks(
                                          api_tasks.reduce((acc, item) => {
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
                                       setSelected_tasks(
                                          api_tasks.reduce((acc, item) => {
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
                                       setSelected_tasks(
                                          api_tasks.reduce((acc, item) => {
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
                  {Object.keys(selected_tasks).length > 0 && (
                     <div className="flex items-center gap-3">
                        <div>Đã chọn {Object.keys(selected_tasks).length} tác vụ</div>
                        <Button danger icon={<DeleteOutlined />} type="primary" onClick={() => setSelected_tasks({})} />
                     </div>
                  )}
               </div>
            }
         >
            <List
               dataSource={api_tasks}
               className="max-h-96 overflow-y-auto"
               renderItem={(item) => {
                  return (
                     <List.Item
                        onClick={() => {
                           setSelected_tasks((prev) => {
                              if (prev[item.id]) {
                                 const { [item.id]: _, ...rest } = prev
                                 return rest
                              }
                              return { ...prev, [item.id]: item }
                           })
                        }}
                     >
                        <List.Item.Meta
                           avatar={<Checkbox checked={!!selected_tasks[item.id]} />}
                           title={item.name}
                           description={
                              item.fixer
                                 ? `${item.fixer.username} • ${dayjs(item.fixerDate).format("DD/MM/YYYY")} • ${item.issues.find((i) => i.issueSpareParts.length > 0) ? (item.confirmReceipt ? "Đã lấy linh kiện" : "Chưa lấy linh kiện") : ""}`
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
                        tasks: Object.values(selected_tasks),
                     },
                     {
                        onSettled: async () => {
                           setSelected_tasks({})
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
                  const tasksWithSpareParts = Object.values(selected_tasks).filter((task) =>
                     task.issues.find((issue) => issue.issueSpareParts.length > 0),
                  )
                  mutate_taskConfirmReceipt.mutate(
                     {
                        taskIds: tasksWithSpareParts.map((task) => task.id),
                     },
                     {
                        onSettled: async () => {
                           setSelected_tasks({})
                           await api_requests.refetch()
                        },
                     },
                  )
               }}
            >
               Lấy linh kiện
            </Button>
            <Button
               block
               type="default"
               onClick={() => {
                  mutate_taskStart.mutate(
                     {
                        tasks: Object.values(selected_tasks),
                     },
                     {
                        onSettled: async () => {
                           setSelected_tasks({})
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
                        tasks: Object.values(selected_tasks),
                     },
                     {
                        onSettled: async () => {
                           setSelected_tasks({})
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
                        tasks: Object.values(selected_tasks),
                     },
                     {
                        onSettled: async () => {
                           setSelected_tasks({})
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
   )
}

export default FixTaskListSection
