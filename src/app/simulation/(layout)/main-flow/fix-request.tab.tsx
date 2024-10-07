"use client"

import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import Card from "antd/es/card"
import { Checkbox, InputNumber, List, Space, Splitter, Tag } from "antd"
import Button from "antd/es/button"
import { useRef, useState } from "react"
import simulation_mutations from "@/features/simulation/mutations"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { DeleteOutlined } from "@ant-design/icons"
import FixRequest_ApproveModal, {
   FixRequest_ApproveModalProps,
} from "@/features/simulation/components/overlay/FixRequest_Approve.modal"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

function FixRequestTab() {
   const [no_requests, setNoRequests] = useState<number>(0)
   const [list, setList] = useState<RequestDto[]>([])
   const [selected_requests, setSelectedRequests] = useState<{
      [key: string]: RequestDto
   }>({})

   const mutate_createManyRequests = simulation_mutations.request.createMany()
   const mutate_updateSeenRequests = simulation_mutations.request.updateSeen()
   const mutate_approveRequests = simulation_mutations.request.approve()
   const mutate_updateRejectRequests = simulation_mutations.request.reject()

   const control_fixRequest_approveModal = useRef<RefType<FixRequest_ApproveModalProps> | null>(null)

   function handleClear() {
      setSelectedRequests({})
      setNoRequests(0)
      setList([])
   }

   async function handleFinish(
      requests: RequestDto[],
      no_issues: number,
      no_spareParts: number,
      no_approved: number,
      no_rejected: number,
   ) {
      control_fixRequest_approveModal.current?.handleClose()

      const approved_requests = requests.slice(0, no_approved)
      const rejected_requests = requests.slice(no_approved, no_approved + no_rejected)

      await mutate_approveRequests.mutateAsync(
         {
            requests: approved_requests,
            no_spareParts,
            no_issues,
         },
         {
            onSuccess: (data) => {
               setList((prev) => {
                  return prev.map((item) => {
                     if (approved_requests.find((req) => req.id === item.id)) {
                        return { ...item, status: FixRequestStatus.APPROVED }
                     }
                     return item
                  })
               })
            },
         },
      )

      await mutate_updateRejectRequests.mutateAsync(
         {
            requestIds: rejected_requests.map((req) => req.id),
         },
         {
            onSuccess: (data) => {
               setList((prev) => {
                  return prev.map((item) => {
                     if (rejected_requests.find((req) => req.id === item.id)) {
                        return { ...item, status: FixRequestStatus.REJECTED }
                     }
                     return item
                  })
               })
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
               setList((prev) => {
                  return prev.map((item) => {
                     if (data.requests.find((req) => req.id === item.id)) {
                        return { ...item, is_seen: true }
                     }
                     return item
                  })
               })
            },
         },
      )
   }

   return (
      <>
         <article className="flex h-full flex-col gap-3">
            <section className="flex flex-col gap-2">
               <Card
                  title={`Số lượng yêu cầu sửa chữa`}
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
                        {list.length > 0 && (
                           <Checkbox
                              checked={Object.keys(selected_requests).length === list.length}
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
                     dataSource={list}
                     className="max-h-96 overflow-y-auto"
                     renderItem={(item) => (
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
                           {item.status === FixRequestStatus.APPROVED && (
                              <div className="mr-4 flex items-center gap-2">
                                 <div>{item.issues?.length ?? 0} lỗi</div>•
                                 <div>{item.issues?.[0].issueSpareParts?.length ?? 0} linh kiện</div>
                              </div>
                           )}
                           <Tag color={FixRequest_StatusMapper(item).colorInverse}>
                              {FixRequest_StatusMapper(item).text}
                           </Tag>
                        </List.Item>
                     )}
                  />
               </Card>
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
                        control_fixRequest_approveModal.current?.handleOpen({
                           requests: Object.values(selected_requests),
                        })
                     }}
                  >
                     Cập nhật: Xác nhận
                  </Button>
               </Card>
            </section>
         </article>
         <OverlayControllerWithRef ref={control_fixRequest_approveModal}>
            <FixRequest_ApproveModal handleFinish={handleFinish} />
         </OverlayControllerWithRef>
      </>
   )
}

export default FixRequestTab
