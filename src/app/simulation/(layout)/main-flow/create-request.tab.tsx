import { FixRequest_StatusData, FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import Card from "antd/es/card"
import { Checkbox, InputNumber, List, Tag } from "antd"
import Button from "antd/es/button"
import { useState } from "react"
import simulation_mutations from "@/features/simulation/mutations"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { requestIdHasherUtil } from "@/lib/domain/Request/RequestIdHasherUtil"
import { DeleteOutlined } from "@ant-design/icons"

function CreateRequestTab() {
   const [no_requests, setNoRequests] = useState<number>(0)
   const [list, setList] = useState<RequestDto[]>([])
   const [selected_requests, setSelectedRequests] = useState<{
      [key: string]: RequestDto
   }>({})

   const mutate_createManyRequests = simulation_mutations.request.createMany()

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

   return (
      <article className="grid h-full grid-cols-3 gap-3">
         <section className="col-span-1">
            <Card
               title={`Số lượng yêu cầu`}
               extra={<Tag color={FixRequest_StatusData("pending").color}>{FixRequest_StatusData("pending").text}</Tag>}
               // size="small"
               className=""
               actions={[
                  <Button type="text" key="clear">
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
         <section className="col-span-2 h-full">
            <Card
               title="Kết quả"
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
                                 <h4>Mã yêu cầu: {requestIdHasherUtil(item.id)}</h4>
                              </div>
                           }
                           description={item.device.id}
                        />
                        <Tag color={FixRequest_StatusMapper(item).colorInverse}>
                           {FixRequest_StatusMapper(item).text}
                        </Tag>
                     </List.Item>
                  )}
               />
            </Card>
         </section>
      </article>
   )
}

export default CreateRequestTab
