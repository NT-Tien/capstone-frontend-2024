"use client"

import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import Card from "antd/es/card"
import { Checkbox, Dropdown, InputNumber, List, Steps, Tag } from "antd"
import Button from "antd/es/button"
import { useMemo, useRef, useState } from "react"
import simulation_mutations from "@/features/simulation/mutations"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { CheckOutlined, CloseOutlined, DeleteOutlined, DownOutlined } from "@ant-design/icons"
import { FixRequest_ApproveModalProps } from "@/features/simulation/components/overlay/oldFixRequest_Approve.modal"
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
   const [selected_requests_finished, setSelectedRequestsFinished] = useState<{
      [key: string]: RequestDto
   }>({})
   const [selected_tasks_send, setSelectedTasksSend] = useState<{
      [key: string]: TaskDto
   }>({})
   const [selected_tasks_receive, setSelectedTasksReceive] = useState<{
      [key: string]: TaskDto
   }>({})

   const api_requests = useQuery({
      queryKey: ["simulation", "requests", "many-by-ids", list],
      queryFn: () => Admin_Requests_ManyByIds({ ids: list.map((item) => item.id) }),
      enabled: list.length > 0,
   })

   const mutate_createManyRequests = simulation_mutations.request.createManyWarranty()
   const mutate_updateSeenRequests = simulation_mutations.request.updateSeen()
   const mutate_updateRejectRequests = simulation_mutations.request.reject()
   const mutate_createSendWarrantyTasks = simulation_mutations.request.createSendWarrantyTasks()
   const mutate_createReceiveWarrantyTasks = simulation_mutations.request.createReceiveWarrantyTasks()
   const mutate_approveWarrantyRequests = simulation_mutations.request.approveWarranty()
   const mutate_feedbackRequest = simulation_mutations.request.feedback()
   const mutate_taskAssignFixer = simulation_mutations.task.assignFixer()
   const mutate_taskFinish = simulation_mutations.task.finish()
   const mutate_taskStart = simulation_mutations.task.start()
   const mutate_taskVerifySendWarrantyComplete = simulation_mutations.task.verifyWarrantySendComplete()
   const mutate_taskHeadMaintenanceConfirm = simulation_mutations.task.headMaintenanceConfirm()
   const mutate_closeRequest = simulation_mutations.request.close()

   const control_warrantyRequest_approveModal = useRef<RefType<FixRequest_ApproveModalProps> | null>(null)

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

   const api_requests_finished = useMemo(() => {
      const result: RequestDto[] = []
      if (!api_requests.data) return result
      for (const req of api_requests.data) {
         if (req.tasks.length > 0 && !!req.tasks.find((task) => task.status !== TaskStatus.COMPLETED) === false) {
            result.push(req)
         }
      }
      return result
   }, [api_requests.data])

   function handleClear() {
      setSelectedRequests({})
      setNoRequests(0)
      setList([])
   }

   async function handleCreateReceiveWarrantyTasks(requests: RequestDto[]) {
      await mutate_createReceiveWarrantyTasks.mutateAsync(
         {
            requests,
         },
         {
            onSuccess: () => {
               setSelectedRequests({})
            },
            onSettled: () => {
               api_requests.refetch()
            },
         },
      )
   }

   async function handleCreateSendWarrantyTasks(requests: RequestDto[]) {
      await mutate_createSendWarrantyTasks.mutateAsync(
         {
            requests,
         },
         {
            onSuccess: () => {
               setSelectedRequests({})
            },
            onSettled: () => {
               api_requests.refetch()
            },
         },
      )
   }

   async function handleFeedbackRequest(requests: RequestDto[]) {
      await mutate_feedbackRequest.mutateAsync(
         {
            requests,
         },
         {
            onSuccess: () => {
               api_requests.refetch()
               setSelectedRequests({})
               setSelectedRequestsFinished({})
            },
         },
      )
   }

   async function handleTaskHeadMaintenanceConfirm(tasks: TaskDto[]) {
      await mutate_taskHeadMaintenanceConfirm.mutateAsync(
         {
            tasks,
         },
         {
            onSuccess: () => {
               api_requests.refetch()
               setSelectedTasksSend({})
               setSelectedTasksReceive({})
            },
         },
      )
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
               setSelectedTasksSend({})
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
               setSelectedTasksSend({})
               setSelectedTasksReceive({})
            },
         },
      )
   }

   async function handleStartTasks(tasks: TaskDto[]) {
      await mutate_taskStart.mutateAsync(
         {
            tasks,
         },
         {
            onSuccess: () => {
               api_requests.refetch()
               setSelectedTasksSend({})
               setSelectedTasksReceive({})
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
               setSelectedTasksSend({})
               setSelectedTasksReceive({})
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
         { count },
         {
            onSuccess: (data) => {
               setNoRequests(0)
               setList(data.requests)
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
                        <h1>Yêu cầu được tạo {api_requests.isSuccess ? `(${api_requests.data.length})` : ""}</h1>
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
                                 description={`${item.requester.username} | ${item.device.machineModel.name}`}
                              />
                              {item.is_seen ? undefined : <Tag color="green">Chưa xem</Tag>}
                              {(item.status === FixRequestStatus.APPROVED ||
                                 item.status === FixRequestStatus.IN_PROGRESS) && (
                                 <div className="mr-3 flex flex-col text-sm text-neutral-500">
                                    <div className="flex items-center gap-2">
                                       {sendToWarrantyIssue?.status === IssueStatusEnum.RESOLVED ? (
                                          <CheckOutlined />
                                       ) : (
                                          <CloseOutlined />
                                       )}
                                       Gửi máy
                                    </div>
                                    <div className="flex items-center gap-2">
                                       {receiveFromWarrantyIssue?.status === IssueStatusEnum.RESOLVED ? (
                                          <CheckOutlined />
                                       ) : (
                                          <CloseOutlined />
                                       )}
                                       Nhận máy
                                    </div>
                                 </div>
                                 // <Steps
                                 //    className="mr-3"
                                 //    type="inline"
                                 //    current={
                                 //       sendToWarrantyIssue?.status === IssueStatusEnum.RESOLVED
                                 //          ? 1
                                 //          : receiveFromWarrantyIssue?.status === IssueStatusEnum.RESOLVED
                                 //            ? 2
                                 //            : 0
                                 //    }
                                 //    items={[
                                 //       {
                                 //          title: "Gửi máy",
                                 //          status: (function () {
                                 //             switch (sendToWarrantyIssue?.status) {
                                 //                case IssueStatusEnum.PENDING:
                                 //                   return "wait"
                                 //                case IssueStatusEnum.FAILED:
                                 //                   return "error"
                                 //                case IssueStatusEnum.RESOLVED:
                                 //                   return "finish"
                                 //                default:
                                 //                   return "process"
                                 //             }
                                 //          })(),
                                 //       },
                                 //       {
                                 //          title: "Lắp máy",
                                 //          status: (function () {
                                 //             switch (receiveFromWarrantyIssue?.status) {
                                 //                case IssueStatusEnum.PENDING:
                                 //                   return "wait"
                                 //                case IssueStatusEnum.FAILED:
                                 //                   return "error"
                                 //                case IssueStatusEnum.RESOLVED:
                                 //                   return "finish"
                                 //                default:
                                 //                   return "process"
                                 //             }
                                 //          })(),
                                 //       },
                                 //    ]}
                                 // />
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
                        Cập nhật: Xác nhận yêu cầu
                     </Button>
                     <Button
                        block
                        disabled={Object.keys(selected_requests).length === 0}
                        onClick={() => handleCreateSendWarrantyTasks(Object.values(selected_requests))}
                     >
                        Thêm tác vụ: Đem máy đi bảo hành
                     </Button>
                     <Button
                        block
                        disabled={Object.keys(selected_requests).length === 0}
                        onClick={() => handleCreateReceiveWarrantyTasks(Object.values(selected_requests))}
                     >
                        Thêm tác vụ: Lắp máy đã bảo hành
                     </Button>
                     <Button
                        block
                        disabled={Object.keys(selected_requests).length === 0}
                        onClick={() => handleCloseRequests(Object.values(selected_requests))}
                     >
                        Hoàn thành yêu cầu
                     </Button>
                     <Button
                        block
                        disabled={Object.keys(selected_requests).length === 0}
                        onClick={() => handleFeedbackRequest(Object.values(selected_requests))}
                     >
                        Cập nhật: Thêm đánh giá
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
                              {api_requests.isSuccess && api_requests.data.length > 0 && api_tasks_send && (
                                 <div>
                                    <Checkbox
                                       checked={Object.keys(selected_tasks_send).length === api_tasks_send.length}
                                       onChange={(e) => {
                                          if (e.target.checked) {
                                             setSelectedTasksSend(
                                                api_tasks_send.reduce((acc, item) => {
                                                   acc[item.id] = item
                                                   return acc
                                                }, {} as any),
                                             )
                                          } else {
                                             setSelectedTasksSend({})
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
                                                   setSelectedTasksSend(
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
                                                   setSelectedTasksSend(
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
                                                   setSelectedTasksSend(
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
                              {Object.keys(selected_tasks_send).length > 0 && (
                                 <div className="flex items-center gap-3">
                                    <div>Đã chọn {Object.keys(selected_tasks_send).length} tác vụ</div>
                                    <Button
                                       danger
                                       icon={<DeleteOutlined />}
                                       type="primary"
                                       onClick={() => setSelectedTasksSend({})}
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
                                       setSelectedTasksSend((prev) => {
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
                                             <Checkbox checked={!!selected_tasks_send[item.id]} />
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
                           disabled={Object.keys(selected_tasks_send).length === 0}
                           onClick={() => api_tasks_send && handleAssignFixer(Object.values(selected_tasks_send))}
                        >
                           Cập nhật: Phân công tác vụ
                        </Button>
                        <Button
                           block
                           disabled={Object.keys(selected_tasks_send).length === 0}
                           onClick={() => handleStartTasks(Object.values(selected_tasks_send))}
                        >
                           Cập nhật: Bắt đầu tác vụ
                        </Button>
                        <Button
                           block
                           disabled={Object.keys(selected_tasks_send).length === 0}
                           onClick={() => handleFinishTasks(Object.values(selected_tasks_send))}
                        >
                           Cập nhật: Hoàn thành tác vụ
                        </Button>
                        <Button
                           block
                           disabled={Object.keys(selected_tasks_send).length === 0}
                           onClick={() => handleTaskVerifySendWarrantyComplete(Object.values(selected_tasks_send))}
                        >
                           Cập nhật: Thời gian bảo hành xong
                        </Button>
                     </Card>
                  </section>
               )}
            {api_requests.isSuccess &&
               api_requests.data.length > 0 &&
               api_requests.data?.find(
                  (req) => req.status !== FixRequestStatus.PENDING && req.status !== FixRequestStatus.REJECTED,
               ) &&
               api_tasks_receive.length > 0 && (
                  <section className="flex flex-col gap-3">
                     <Card
                        title={
                           <div className="flex items-center gap-2">
                              {api_requests.isSuccess && api_requests.data.length > 0 && api_tasks_receive && (
                                 <div>
                                    <Checkbox
                                       checked={Object.keys(selected_tasks_receive).length === api_tasks_receive.length}
                                       onChange={(e) => {
                                          if (e.target.checked) {
                                             setSelectedTasksReceive(
                                                api_tasks_receive.reduce((acc, item) => {
                                                   acc[item.id] = item
                                                   return acc
                                                }, {} as any),
                                             )
                                          } else {
                                             setSelectedTasksReceive({})
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
                                                   setSelectedTasksReceive(
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
                                                   setSelectedTasksReceive(
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
                                                   setSelectedTasksReceive(
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
                              <h1>Tác vụ lắp máy bảo hành</h1>
                           </div>
                        }
                        extra={
                           <div>
                              {Object.keys(api_tasks_receive).length > 0 && (
                                 <div className="flex items-center gap-3">
                                    <div>Đã chọn {Object.keys(api_tasks_receive).length} tác vụ</div>
                                    <Button
                                       danger
                                       icon={<DeleteOutlined />}
                                       type="primary"
                                       onClick={() => setSelectedTasksReceive({})}
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
                                       setSelectedTasksReceive((prev) => {
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
                                             <Checkbox checked={!!selected_tasks_receive[item.id]} />
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
                           disabled={Object.keys(selected_tasks_receive).length === 0}
                           onClick={() => api_tasks_receive && handleAssignFixer(Object.values(selected_tasks_receive))}
                        >
                           Cập nhật: Phân công tác vụ
                        </Button>
                        <Button
                           block
                           disabled={Object.keys(selected_tasks_receive).length === 0}
                           onClick={() => handleStartTasks(Object.values(selected_tasks_receive))}
                        >
                           Cập nhật: Bắt đầu tác vụ
                        </Button>
                        <Button
                           block
                           disabled={Object.keys(selected_tasks_receive).length === 0}
                           onClick={() => handleFinishTasks(Object.values(selected_tasks_receive))}
                        >
                           Cập nhật: Hoàn thành tác vụ
                        </Button>
                        <Button
                           block
                           disabled={Object.keys(selected_tasks_receive).length === 0}
                           onClick={() => handleTaskHeadMaintenanceConfirm(Object.values(selected_tasks_receive))}
                        >
                           Cập nhật: Xác nhận Kiểm tra
                        </Button>
                     </Card>
                  </section>
               )}
            {/*{api_requests_finished.length > 0 && (*/}
            {/*   <section className="flex flex-col gap-3">*/}
            {/*      <Card*/}
            {/*         title={*/}
            {/*            <div className="flex items-center gap-2">*/}
            {/*               {api_requests_finished.length > 0 && (*/}
            {/*                  <div>*/}
            {/*                     <Checkbox*/}
            {/*                        checked={*/}
            {/*                           Object.keys(selected_requests_finished).length === api_requests_finished.length*/}
            {/*                        }*/}
            {/*                        onChange={(e) => {*/}
            {/*                           if (e.target.checked) {*/}
            {/*                              setSelectedRequestsFinished(*/}
            {/*                                 list.reduce((acc, item) => {*/}
            {/*                                    acc[item.id] = item*/}
            {/*                                    return acc*/}
            {/*                                 }, {} as any),*/}
            {/*                              )*/}
            {/*                           } else {*/}
            {/*                              setSelectedRequestsFinished({})*/}
            {/*                           }*/}
            {/*                        }}*/}
            {/*                     />*/}
            {/*                     <Dropdown*/}
            {/*                        menu={{*/}
            {/*                           items: [*/}
            {/*                              {*/}
            {/*                                 label: "Chọn tất cả chưa xử lý",*/}
            {/*                                 key: "all-pending",*/}
            {/*                                 onClick: () => {*/}
            {/*                                    setSelectedRequestsFinished(*/}
            {/*                                       api_requests_finished.reduce((acc, item) => {*/}
            {/*                                          if (item.status === FixRequestStatus.PENDING) {*/}
            {/*                                             acc[item.id] = item*/}
            {/*                                          }*/}
            {/*                                          return acc*/}
            {/*                                       }, {} as any),*/}
            {/*                                    )*/}
            {/*                                 },*/}
            {/*                              },*/}
            {/*                              {*/}
            {/*                                 label: "Chọn tất cả Xác nhận",*/}
            {/*                                 key: "all-approved",*/}
            {/*                                 onClick: () => {*/}
            {/*                                    setSelectedRequestsFinished(*/}
            {/*                                       api_requests_finished.reduce((acc, item) => {*/}
            {/*                                          if (item.status === FixRequestStatus.APPROVED) {*/}
            {/*                                             acc[item.id] = item*/}
            {/*                                          }*/}
            {/*                                          return acc*/}
            {/*                                       }, {} as any),*/}
            {/*                                    )*/}
            {/*                                 },*/}
            {/*                              },*/}
            {/*                           ],*/}
            {/*                        }}*/}
            {/*                     >*/}
            {/*                        <Button size="small" type="text" icon={<DownOutlined />} />*/}
            {/*                     </Dropdown>*/}
            {/*                  </div>*/}
            {/*               )}*/}
            {/*               <h1>Yêu cầu đã hoàn thành {`(${api_requests_finished.length})`}</h1>*/}
            {/*            </div>*/}
            {/*         }*/}
            {/*      >*/}
            {/*         <List*/}
            {/*            dataSource={api_requests_finished}*/}
            {/*            className="max-h-96 overflow-y-auto"*/}
            {/*            renderItem={(item) => {*/}
            {/*               return (*/}
            {/*                  <List.Item*/}
            {/*                     onClick={() => {*/}
            {/*                        setSelectedRequestsFinished((prev) => {*/}
            {/*                           if (prev[item.id]) {*/}
            {/*                              const { [item.id]: _, ...rest } = prev*/}
            {/*                              return rest*/}
            {/*                           }*/}
            {/*                           return { ...prev, [item.id]: item }*/}
            {/*                        })*/}
            {/*                     }}*/}
            {/*                  >*/}
            {/*                     <List.Item.Meta*/}
            {/*                        title={*/}
            {/*                           <div className="flex items-center gap-2">*/}
            {/*                              <Checkbox checked={!!selected_requests_finished[item.id]} />*/}
            {/*                              <h4>Mã yêu cầu: {item.id}</h4>*/}
            {/*                           </div>*/}
            {/*                        }*/}
            {/*                        description={item.device.id}*/}
            {/*                     />*/}
            {/*                     <Tag color={FixRequest_StatusMapper(item).colorInverse}>*/}
            {/*                        {FixRequest_StatusMapper(item).text}*/}
            {/*                     </Tag>*/}
            {/*                  </List.Item>*/}
            {/*               )*/}
            {/*            }}*/}
            {/*         />*/}
            {/*      </Card>*/}
            {/*      <Card>*/}
            {/*         <Button*/}
            {/*            block*/}
            {/*            disabled={Object.keys(selected_requests_finished).length === 0}*/}
            {/*            onClick={() => handleCloseRequests(Object.values(selected_requests_finished))}*/}
            {/*         >*/}
            {/*            Hoàn thành yêu cầu*/}
            {/*         </Button>*/}
            {/*         <Button*/}
            {/*            block*/}
            {/*            disabled={Object.keys(selected_requests_finished).length === 0}*/}
            {/*            onClick={() => handleFeedbackRequest(Object.values(selected_requests_finished))}*/}
            {/*         >*/}
            {/*            Cập nhật: Thêm đánh giá*/}
            {/*         </Button>*/}
            {/*      </Card>*/}
            {/*   </section>*/}
            {/*)}*/}
         </article>
         <OverlayControllerWithRef ref={control_warrantyRequest_approveModal}>
            <WarrantyRequest_ApproveModal handleFinish={handleApproveWarranty} />
         </OverlayControllerWithRef>
      </>
   )
}

export default WarrantyRequestTab
