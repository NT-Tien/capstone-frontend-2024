import { useSimulationStore } from "@/app/simulation/(layout)/main-flow/store-provider"
import admin_queries from "@/features/admin/queries"
import AuthTokens from "@/lib/constants/AuthTokens"
import { Checkbox, Dropdown, List, Tabs, Tag } from "antd"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import Button from "antd/es/button"
import { DeleteOutlined, DownOutlined } from "@ant-design/icons"
import Card from "antd/es/card"
import { useRef, useState } from "react"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import simulation_mutations from "@/features/simulation/mutations"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import FixRequest_ApproveModal, {
   FixRequest_ApproveModalProps,
} from "@/features/simulation/components/overlay/FixRequest_Approve.modal"
import WarrantyRequest_ApproveModal, {
   WarrantyRequest_ApprovalModalProps,
} from "@/features/simulation/components/overlay/WarrantyRequest_Approve.modal"
import WarrantyTaskListSection from "@/app/simulation/(layout)/main-flow/WarrantyTaskList.section"
import FixTaskListSection from "@/app/simulation/(layout)/main-flow/FixTaskList.section"
import ImportTab from "@/app/simulation/(layout)/main-flow/Import.tab"

function RequestListCard() {
   const store = useSimulationStore((state) => state)

   const control_fixRequest_approveModal = useRef<RefType<FixRequest_ApproveModalProps>>(null)
   const control_warrantyRequest_approveModal = useRef<RefType<WarrantyRequest_ApprovalModalProps>>(null)

   const [tab, setTab] = useState<string>("fix")
   const [selected_requests, setSelectedRequests] = useState<{
      [key: string]: RequestDto
   }>({})
   const [step, setStep] = useState(1)

   const api_requests = admin_queries.request.manyByIds({
      ids: (function () {
         switch (tab) {
            case "fix":
               return store.idLists_fixRequest
            case "warranty":
               return store.idLists_warrantyRequest
            default:
               return []
         }
      })(),
      token: AuthTokens.Admin,
   })

   const mutate_updateSeenRequests = simulation_mutations.request.updateSeen()
   const mutate_feedbackRequest = simulation_mutations.request.feedback()
   const mutate_closeRequest = simulation_mutations.request.close()
   const mutate_requestCreateTasks = simulation_mutations.request.createTasks()

   return (
      <div>
         <Tabs
            onChange={(key) => {
               setTab(key)
               setSelectedRequests({})
            }}
            activeKey={tab}
            items={[
               {
                  label: `Sửa chữa (${store.idLists_fixRequest.length})`,
                  key: "fix",
               },
               {
                  label: `Bảo hành (${store.idLists_warrantyRequest.length})`,
                  key: "warranty",
               },
               {
                  label: "Giả lập nhập kho",
                  key: "import",
               },
            ]}
         />
         {(tab === "fix" || tab === "warranty") && (
            <>
               <Card
                  title={
                     <div className="flex items-center gap-2">
                        {api_requests.isSuccess && api_requests.data.length > 0 && (
                           <div className="flex items-center">
                              <Checkbox
                                 checked={Object.keys(selected_requests).length === api_requests.data.length}
                                 onChange={(e) => {
                                    if (e.target.checked) {
                                       setSelectedRequests(
                                          api_requests.data.reduce((acc, item) => {
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
                                       {
                                          label: "Chọn tất cả Đang thực hiện",
                                          key: "all-in-progress",
                                          onClick: () => {
                                             setSelectedRequests(
                                                api_requests.data.reduce((acc, item) => {
                                                   if (item.status === FixRequestStatus.IN_PROGRESS) {
                                                      acc[item.id] = item
                                                   }
                                                   return acc
                                                }, {} as any),
                                             )
                                          },
                                       },
                                       {
                                          label: "Chọn tất cả Chờ đánh giá",
                                          key: "all-in-progress",
                                          onClick: () => {
                                             setSelectedRequests(
                                                api_requests.data.reduce((acc, item) => {
                                                   if (item.status === FixRequestStatus.HEAD_CONFIRM) {
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
                  actions={[
                     <Button
                        type="link"
                        key="view"
                        className="w-full"
                        onClick={() => {
                           setStep(2)
                           mutate_updateSeenRequests.mutate(
                              {
                                 requestIds: Object.keys(selected_requests),
                              },
                              {
                                 onSettled: async () => {
                                    setSelectedRequests({})
                                    await api_requests.refetch()
                                 },
                              },
                           )
                        }}
                     >
                        1) Cập nhật: Xem
                     </Button>,
                     <Button
                        type="link"
                        key="approve"
                        className="w-full"
                        onClick={() => {
                           setStep(3)
                           if (tab === "fix") {
                              control_fixRequest_approveModal.current?.handleOpen({
                                 requests: Object.values(selected_requests),
                              })
                           }
                           if (tab === "warranty") {
                              control_warrantyRequest_approveModal.current?.handleOpen({
                                 requests: Object.values(selected_requests),
                              })
                           }
                        }}
                     >
                        2) Xác nhận yêu cầu
                     </Button>,
                     ...(tab === "fix"
                        ? [
                             <Button
                                key="create-task"
                                type="link"
                                onClick={() => {
                                   setStep(4)
                                   mutate_requestCreateTasks.mutate(
                                      {
                                         requests: Object.values(selected_requests),
                                      },
                                      {
                                         onSettled: async () => {
                                            setSelectedRequests({})
                                            setTimeout(() => {
                                               api_requests.refetch()
                                            }, 500)
                                         },
                                      },
                                   )
                                }}
                             >
                                3) Tạo tác vụ
                             </Button>,
                             <Button
                                key="close-request"
                                type="link"
                                onClick={() => {
                                   setStep(5)
                                   mutate_closeRequest.mutate(
                                      {
                                         requests: Object.values(selected_requests),
                                      },
                                      {
                                         onSettled: async () => {
                                            setSelectedRequests({})
                                            await api_requests.refetch()
                                         },
                                      },
                                   )
                                }}
                             >
                                4) Đóng yêu cầu
                             </Button>,
                             <Button
                                key="create-task"
                                type="link"
                                onClick={() => {
                                   setStep(6)
                                   mutate_feedbackRequest.mutate(
                                      {
                                         requests: Object.values(selected_requests),
                                      },
                                      {
                                         onSettled: async () => {
                                            setSelectedRequests({})
                                            await api_requests.refetch()
                                         },
                                      },
                                   )
                                }}
                             >
                                5) Thêm đánh giá
                             </Button>,
                          ]
                        : []),
                     ...(tab === "warranty"
                        ? [
                             <Button
                                key="close-request"
                                type="link"
                                onClick={() => {
                                   setStep(4)
                                   mutate_closeRequest.mutate(
                                      {
                                         requests: Object.values(selected_requests),
                                      },
                                      {
                                         onSettled: async () => {
                                            setSelectedRequests({})
                                            await api_requests.refetch()
                                         },
                                      },
                                   )
                                }}
                             >
                                3) Đóng tác vụ
                             </Button>,
                             <Button
                                key="feedback-request"
                                type="link"
                                onClick={() => {
                                   setStep(5)
                                   mutate_feedbackRequest.mutate(
                                      {
                                         requests: Object.values(selected_requests),
                                      },
                                      {
                                         onSettled: async () => {
                                            setSelectedRequests({})
                                            await api_requests.refetch()
                                         },
                                      },
                                   )
                                }}
                             >
                                4) Thêm đánh giá
                             </Button>,
                          ]
                        : []),
                  ]}
               >
                  <List
                     dataSource={api_requests.data}
                     className="max-h-96 overflow-y-auto"
                     renderItem={(item) => {
                        return (
                           <List.Item
                              extra={
                                 <div>
                                    <Tag color={FixRequest_StatusMapper(item).colorInverse}>
                                       {FixRequest_StatusMapper(item).text}
                                    </Tag>
                                 </div>
                              }
                           >
                              <List.Item.Meta
                                 avatar={
                                    <Checkbox
                                       checked={selected_requests[item.id] !== undefined}
                                       onChange={(e) => {
                                          if (e.target.checked) {
                                             setSelectedRequests({
                                                ...selected_requests,
                                                [item.id]: item,
                                             })
                                          } else {
                                             const { [item.id]: _, ...rest } = selected_requests
                                             setSelectedRequests(rest)
                                          }
                                       }}
                                    />
                                 }
                                 title={
                                    <div className="flex items-center">
                                       {!item.is_seen && <Tag color="green">Mới</Tag>}
                                       <h3>{item.device.machineModel.name}</h3>
                                    </div>
                                 }
                                 description={
                                    <div>
                                       {item.device?.area?.name ?? "-"} • {item.requester.username} •{" "}
                                       {item.requester_note} • {item.issues?.length ?? 0} lỗi •{" "}
                                       {item.tasks?.length ?? 0} tác vụ
                                    </div>
                                 }
                              ></List.Item.Meta>
                           </List.Item>
                        )
                     }}
                  />
               </Card>
               <div className="mt-layout">
                  {tab === "warranty" && store.hasApproved_warranyRequest && <WarrantyTaskListSection />}
                  {tab === "fix" && store.hasApproved_fixRequest && <FixTaskListSection />}
               </div>
            </>
         )}
         {tab === "import" && <ImportTab />}
         <OverlayControllerWithRef ref={control_fixRequest_approveModal}>
            <FixRequest_ApproveModal
               onSuccess={async () => {
                  setSelectedRequests({})
                  console.log("FUCK")
                  store.set_hasApproved_fixRequest(true)
                  control_fixRequest_approveModal.current?.handleClose()
                  await api_requests.refetch()
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_warrantyRequest_approveModal}>
            <WarrantyRequest_ApproveModal
               onSuccess={async () => {
                  setSelectedRequests({})
                  store.set_hasApproved_warranyRequest(true)
                  control_warrantyRequest_approveModal.current?.handleClose()
                  await api_requests.refetch()
               }}
            />
         </OverlayControllerWithRef>
      </div>
   )
}

export default RequestListCard
