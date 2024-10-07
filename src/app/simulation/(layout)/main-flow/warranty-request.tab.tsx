"use client"

import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import Card from "antd/es/card"
import { Checkbox, Divider, InputNumber, List, Steps, Tag, Dropdown } from "antd"
import Button from "antd/es/button"
import { useMemo, useRef, useState } from "react"
import simulation_mutations from "@/features/simulation/mutations"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { DeleteOutlined, DownOutlined } from "@ant-design/icons"
import { FixRequest_ApproveModalProps } from "@/features/simulation/components/overlay/FixRequest_Approve.modal"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import WarrantyRequest_ApproveModal from "@/features/simulation/components/overlay/WarrantyRequest_Approve.modal"
import { useQuery } from "@tanstack/react-query"
import Admin_Requests_ManyByIds from "@/features/admin/api/request/many-by-ids.api"
import { ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { TaskDto } from "@/lib/domain/Task/Task.dto"

function WarrantyRequestTab() {
   const [no_requests, setNoRequests] = useState<number>(0)
   const [list, setList] = useState<RequestDto[]>([])
   const [selected_requests, setSelectedRequests] = useState<{
      [key: string]: RequestDto
   }>({})
   const [selected_tasks, setSelectedTasks] = useState<{
      [key: string]: TaskDto
   }>({})

   const api_requests = useQuery({
      queryKey: ["simulation", "requests", "many-by-ids", list],
      queryFn: () => Admin_Requests_ManyByIds({ ids: list.map((item) => item.id) }),
      enabled: list.length > 0,
   })

   const mutate_createManyRequests = simulation_mutations.request.createMany()
   const mutate_updateSeenRequests = simulation_mutations.request.updateSeen()
   const mutate_updateRejectRequests = simulation_mutations.request.reject()
   const mutate_approveWarrantyRequests = simulation_mutations.request.approveWarranty()
   const mutate_taskAssignFixer = simulation_mutations.task.assignFixer()
   const mutate_taskFinish = simulation_mutations.task.finish()
   const mutate_taskVerifySendWarrantyComplete = simulation_mutations.task.verifyWarrantySendComplete()
   const mutate_closeRequest = simulation_mutations.request.close()

   const control_warrantyRequest_approveModal = useRef<RefType<FixRequest_ApproveModalProps> | null>(null)

   const api_tasks = useMemo(() => {
      const result: TaskDto[] = []
      if (!api_requests.data) return result
      for (const req of api_requests.data) {
         if (req.tasks) {
            result.push(...req.tasks)
         }
      }
      return result
   }, [api_requests.data])

   function handleClear() {
      setSelectedRequests({})
      setNoRequests(0)
      setList([])
   }

   async function handleCloseRequests(requests: RequestDto[]) {
      await mutate_closeRequest.mutateAsync(
         {
            requests,
         },
         {
            onSuccess: () => {
               api_requests.refetch()
               setSelectedRequests({})
            },
         },
      )
   }

   async function handleTaskVerifySendWarrantyComplete(tasks: TaskDto[]) {
      await mutate_taskVerifySendWarrantyComplete.mutateAsync(
         {
            tasks,
         },
         {
            onSuccess: () => {
               api_requests.refetch()
               setSelectedTasks({})
            },
         },
      )
   }

   async function handleAssignFixer(tasks: TaskDto[]) {
      await mutate_taskAssignFixer.mutateAsync(
         {
            tasks,
         },
         {
            onSuccess: () => {
               api_requests.refetch()
               setSelectedTasks({})
            },
         },
      )
   }

   async function handleFinishTasks(tasks: TaskDto[], withHeadStaffConfirm?: boolean) {
      await mutate_taskFinish.mutateAsync(
         {
            tasks,
            withHeadStaffConfirm,
         },
         {
            onSuccess: () => {
               api_requests.refetch()
               setSelectedTasks({})
            },
         },
      )
   }

   async function handleApproveWarranty(no_approved: number, no_rejected: number) {
      control_warrantyRequest_approveModal.current?.handleClose()

      const approved_requests = Object.values(selected_requests).slice(0, no_approved)
      const rejected_requests = Object.values(selected_requests).slice(no_approved, no_approved + no_rejected)

      await mutate_approveWarrantyRequests.mutateAsync(
         {
            requests: approved_requests,
         },
         {
            onSuccess: () => {
               api_requests.refetch()
               setSelectedRequests({})
            },
         },
      )

      await mutate_updateRejectRequests.mutateAsync(
         {
            requestIds: rejected_requests.map((req) => req.id),
         },
         {
            onSuccess: () => {
               api_requests.refetch()
               setSelectedRequests({})
            },
         },
      )
   }

   async function handleCreateManyRequests(count: number) {
      mutate_createManyRequests.mutate(
         { count, warrantyOnly: true },
         {
            onSuccess: (data) => {
               setNoRequests(0)
               setList((prev) => [...prev, ...data.requests])
            },
         },
      )
   }

   async function handleUpdateSeenRequests(requestIds: string[]) {
      mutate_updateSeenRequests.mutate(
         { requestIds },
         {
            onSuccess: (data) => {
               api_requests.refetch()
            },
         },
      )
   }

   return (
      <>
         <article className="flex h-full flex-col gap-3">
            <section className="flex flex-col gap-2">
               <Card
                  title={`Số lượng yêu cầu bảo hành`}
                  // size="small"
                  className=""
                  actions={[
                     <Button type="text" key="clear" onClick={handleClear}>
                        Xóa
                     </Button>,
                     <Button
                        type="text"
                        key="submit"
                        onClick={() => handleCreateManyRequests(no_requests)}
                        disabled={no_requests === 0}
                     >
                        Tạo yêu cầu
                     </Button>,
                  ]}
               >
                  <InputNumber
                     className="w-full"
                     min={0}
                     value={no_requests}
                     onChange={(e) => setNoRequests(e ?? 0)}
                     placeholder="Nhập số lượng"
                  />
               </Card>
            </section>
            <section className="flex h-full flex-col gap-2">
               <Card
                  title={
                     <div className="flex items-center gap-2">
                        {api_requests.isSuccess && api_requests.data.length > 0 && (
                           <div>
                              <Checkbox
                                 checked={Object.keys(selected_requests).length === api_requests.data.length}
                                 onChange={(e) => {
                                    if (e.target.checked) {
                                       setSelectedRequests(
                                          list.reduce((acc, item) => {
                                             acc[item.id] = item
                                             return acc
                                          }, {} as any),
                                       )
                                    } else {
                                       setSelectedRequests({})
                                    }
                                 }}
                              />
                              <Dropdown
                                 menu={{
                                    items: [
                                       {
                                          label: "Chọn tất cả chưa xử lý",
                                          key: "all-pending",
                                          onClick: () => {
                                             setSelectedRequests(
                                                api_requests.data.reduce((acc, item) => {
                                                   if (item.status === FixRequestStatus.PENDING) {
                                                      acc[item.id] = item
                                                   }
                                                   return acc
                                                }, {} as any),
                                             )
                                          },
                                       },
                                       {
                                          label: "Chọn tất cả Xác nhận",
                                          key: "all-approved",
                                          onClick: () => {
                                             setSelectedRequests(
                                                api_requests.data.reduce((acc, item) => {
                                                   if (item.status === FixRequestStatus.APPROVED) {
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
                        <h1>Yêu cầu được tạo</h1>
                     </div>
                  }
                  extra={
                     <div>
                        {Object.keys(selected_requests).length > 0 && (
                           <div className="flex items-center gap-3">
                              <div>Đã chọn {Object.keys(selected_requests).length} yêu cầu</div>
                              <Button
                                 danger
                                 icon={<DeleteOutlined />}
                                 type="primary"
                                 onClick={() => setSelectedRequests({})}
                              />
                           </div>
                        )}
                     </div>
                  }
               >
                  <List
                     dataSource={api_requests.data}
                     className="max-h-96 overflow-y-auto"
                     renderItem={(item) => {
                        const sendToWarrantyIssue = item.issues.find((i) => i.typeError.id === SendWarrantyTypeErrorId)
                        const receiveFromWarrantyIssue = item.issues.find(
                           (i) => i.typeError.id === ReceiveWarrantyTypeErrorId,
                        )

                        return (
                           <List.Item
                              onClick={() => {
                                 setSelectedRequests((prev) => {
                                    if (prev[item.id]) {
                                       const { [item.id]: _, ...rest } = prev
                                       return rest
                                    }
                                    return { ...prev, [item.id]: item }
                                 })
                              }}
                           >
                              <List.Item.Meta
                                 title={
                                    <div className="flex items-center gap-2">
                                       <Checkbox checked={!!selected_requests[item.id]} />
                                       <h4>Mã yêu cầu: {item.id}</h4>
                                    </div>
                                 }
                                 description={item.device.id}
                              />
                              {item.is_seen ? undefined : <Tag color="green">Chưa xem</Tag>}
                              {(item.status === FixRequestStatus.APPROVED ||
                                 item.status === FixRequestStatus.IN_PROGRESS) && (
                                 <Steps
                                    className="mr-3"
                                    type="inline"
                                    current={
                                       sendToWarrantyIssue?.status === IssueStatusEnum.RESOLVED
                                          ? 1
                                          : receiveFromWarrantyIssue?.status === IssueStatusEnum.RESOLVED
                                            ? 2
                                            : 0
                                    }
                                    items={[
                                       {
                                          title: "Gửi máy",
                                          status: (function () {
                                             switch (sendToWarrantyIssue?.status) {
                                                case IssueStatusEnum.PENDING:
                                                   return "wait"
                                                case IssueStatusEnum.FAILED:
                                                   return "error"
                                                case IssueStatusEnum.RESOLVED:
                                                   return "finish"
                                                default:
                                                   return "process"
                                             }
                                          })(),
                                       },
                                       {
                                          title: "Lắp máy",
                                          status: (function () {
                                             switch (receiveFromWarrantyIssue?.status) {
                                                case IssueStatusEnum.PENDING:
                                                   return "wait"
                                                case IssueStatusEnum.FAILED:
                                                   return "error"
                                                case IssueStatusEnum.RESOLVED:
                                                   return "finish"
                                                default:
                                                   return "process"
                                             }
                                          })(),
                                       },
                                    ]}
                                 />
                              )}
                              <Tag color={FixRequest_StatusMapper(item).colorInverse}>
                                 {FixRequest_StatusMapper(item).text}
                              </Tag>
                           </List.Item>
                        )
                     }}
                  />
               </Card>
               {api_requests.isSuccess && api_requests.data.length > 0 && (
                  <Card
                     classNames={{
                        body: "flex items-center flex-col gap-2",
                     }}
                  >
                     <Button
                        block
                        onClick={() => handleUpdateSeenRequests(Object.keys(selected_requests))}
                        disabled={Object.keys(selected_requests).length === 0}
                     >
                        Cập nhật: Xem yêu cầu
                     </Button>
                     <Button
                        block
                        disabled={Object.keys(selected_requests).length === 0}
                        onClick={() => {
                           control_warrantyRequest_approveModal.current?.handleOpen({
                              requests: Object.values(selected_requests),
                           })
                        }}
                     >
                        Cập nhật: Xác nhận
                     </Button>
                  </Card>
               )}
            </section>
            {api_requests.isSuccess &&
               api_requests.data.length > 0 &&
               api_requests.data?.find(
                  (req) => req.status !== FixRequestStatus.PENDING && req.status !== FixRequestStatus.REJECTED,
               ) && (
                  <section className="flex flex-col gap-3">
                     <Card
                        title={
                           <div className="flex items-center gap-2">
                              {api_requests.isSuccess && api_requests.data.length > 0 && api_tasks && (
                                 <div>
                                    <Checkbox
                                       checked={Object.keys(selected_tasks).length === api_tasks.length}
                                       onChange={(e) => {
                                          if (e.target.checked) {
                                             setSelectedTasks(
                                                api_tasks.reduce((acc, item) => {
                                                   acc[item.id] = item
                                                   return acc
                                                }, {} as any),
                                             )
                                          } else {
                                             setSelectedTasks({})
                                          }
                                       }}
                                    />
                                    <Dropdown
                                       menu={{
                                          items: [
                                             {
                                                label: "Đem máy bảo hành",
                                                key: "send-warranty",
                                                children: [
                                                   {
                                                      label: "Chọn tất cả Chưa phân công",
                                                      key: "send-all-unassigned",
                                                      onClick: () => {
                                                         setSelectedTasks(
                                                            api_tasks.reduce((acc, item) => {
                                                               if (
                                                                  item.status === TaskStatus.AWAITING_FIXER &&
                                                                  !!item.issues.find(
                                                                     (i) => i.typeError.id === SendWarrantyTypeErrorId,
                                                                  )
                                                               ) {
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
                                                         setSelectedTasks(
                                                            api_tasks.reduce((acc, item) => {
                                                               if (
                                                                  item.status === TaskStatus.ASSIGNED &&
                                                                  !!item.issues.find(
                                                                     (i) => i.typeError.id === SendWarrantyTypeErrorId,
                                                                  )
                                                               ) {
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
                                                         setSelectedTasks(
                                                            api_tasks.reduce((acc, item) => {
                                                               if (
                                                                  item.status === TaskStatus.HEAD_STAFF_CONFIRM &&
                                                                  !!item.issues.find(
                                                                     (i) => i.typeError.id === SendWarrantyTypeErrorId,
                                                                  )
                                                               ) {
                                                                  acc[item.id] = item
                                                               }
                                                               return acc
                                                            }, {} as any),
                                                         )
                                                      },
                                                   },
                                                ],
                                             },
                                             {
                                                label: "Lắp máy bảo hành",
                                                key: "receive-warranty",
                                                children: [
                                                   {
                                                      label: "Chọn tất cả Chưa phân công",
                                                      key: "send-all-unassigned",
                                                      onClick: () => {
                                                         setSelectedTasks(
                                                            api_tasks.reduce((acc, item) => {
                                                               if (
                                                                  item.status === TaskStatus.AWAITING_FIXER &&
                                                                  !!item.issues.find(
                                                                     (i) =>
                                                                        i.typeError.id === ReceiveWarrantyTypeErrorId,
                                                                  )
                                                               ) {
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
                                                         setSelectedTasks(
                                                            api_tasks.reduce((acc, item) => {
                                                               if (
                                                                  item.status === TaskStatus.ASSIGNED &&
                                                                  !!item.issues.find(
                                                                     (i) =>
                                                                        i.typeError.id === ReceiveWarrantyTypeErrorId,
                                                                  )
                                                               ) {
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
                                                         setSelectedTasks(
                                                            api_tasks.reduce((acc, item) => {
                                                               if (
                                                                  item.status === TaskStatus.HEAD_STAFF_CONFIRM &&
                                                                  !!item.issues.find(
                                                                     (i) =>
                                                                        i.typeError.id === ReceiveWarrantyTypeErrorId,
                                                                  )
                                                               ) {
                                                                  acc[item.id] = item
                                                               }
                                                               return acc
                                                            }, {} as any),
                                                         )
                                                      },
                                                   },
                                                ],
                                             },
                                          ],
                                       }}
                                    >
                                       <Button size="small" type="text" icon={<DownOutlined />} />
                                    </Dropdown>
                                 </div>
                              )}
                              <h1>Tác vụ được tạo</h1>
                           </div>
                        }
                        extra={
                           <div>
                              {Object.keys(selected_tasks).length > 0 && (
                                 <div className="flex items-center gap-3">
                                    <div>Đã chọn {Object.keys(selected_tasks).length} tác vụ</div>
                                    <Button
                                       danger
                                       icon={<DeleteOutlined />}
                                       type="primary"
                                       onClick={() => setSelectedTasks({})}
                                    />
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
                                       setSelectedTasks((prev) => {
                                          if (prev[item.id]) {
                                             const { [item.id]: _, ...rest } = prev
                                             return rest
                                          }
                                          return { ...prev, [item.id]: item }
                                       })
                                    }}
                                 >
                                    <List.Item.Meta
                                       title={
                                          <div className="flex items-center gap-2">
                                             <Checkbox checked={!!selected_tasks[item.id]} />
                                             <h4>Mã tác vụ: {item.id}</h4>
                                          </div>
                                       }
                                       description={item.name}
                                    />
                                    <Tag color={TaskStatusTagMapper[item.status].colorInverse}>
                                       {TaskStatusTagMapper[item.status].text}
                                    </Tag>
                                 </List.Item>
                              )
                           }}
                        />
                     </Card>
                     <Card
                        classNames={{
                           body: "flex items-center flex-col gap-2",
                        }}
                     >
                        <Button
                           block
                           disabled={Object.keys(selected_tasks).length === 0}
                           onClick={() => api_tasks && handleAssignFixer(Object.values(selected_tasks))}
                        >
                           Cập nhật: Phân công tác vụ - Đem máy bảo hành
                        </Button>
                        <Button
                           block
                           disabled={Object.keys(selected_tasks).length === 0}
                           onClick={() => handleFinishTasks(Object.values(selected_tasks))}
                        >
                           Cập nhật: Hoàn thành tác vụ - Đem máy bảo hành
                        </Button>
                        <Divider className="my-2" />
                        <Button
                           block
                           disabled={Object.keys(selected_tasks).length === 0}
                           onClick={() => handleTaskVerifySendWarrantyComplete(Object.values(selected_tasks))}
                        >
                           Cập nhật: Thời gian bảo hành xong
                        </Button>
                        <Divider className="my-2" />
                        <Button
                           block
                           disabled={Object.keys(selected_tasks).length === 0}
                           onClick={() => api_tasks && handleAssignFixer(Object.values(selected_tasks))}
                        >
                           Cập nhật: Phân công tác vụ - Lắp máy bảo hành
                        </Button>
                        <Button
                           block
                           disabled={Object.keys(selected_tasks).length === 0}
                           onClick={() => handleFinishTasks(Object.values(selected_tasks), true)}
                        >
                           Cập nhật: Hoàn thành tác vụ - Lắp máy bảo hành
                        </Button>
                     </Card>
                     <Card>
                        <Button
                           block
                           disabled={!!api_tasks.find((t) => t.status !== TaskStatus.COMPLETED)}
                           onClick={() => api_requests.isSuccess && handleCloseRequests(api_requests.data)}
                        >
                           Đóng yêu cầu
                        </Button>
                     </Card>
                  </section>
               )}
         </article>
         <OverlayControllerWithRef ref={control_warrantyRequest_approveModal}>
            <WarrantyRequest_ApproveModal handleFinish={handleApproveWarranty} />
         </OverlayControllerWithRef>
      </>
   )
}

export default WarrantyRequestTab
