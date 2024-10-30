"use client"

import { Card, Tooltip, Tag, Drawer, Collapse } from "antd"
import ProList from "@ant-design/pro-list"
import ProDescriptions from "@ant-design/pro-descriptions"
import dayjs from "dayjs"
import { UpOutlined, DownOutlined } from "@ant-design/icons"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"

const { Panel } = Collapse

type FixingHistorySectionProps = {
   deviceHistory_page: number
   api_deviceRequestHistory: any
   api_request: any
   openDrawer: (entity: RequestDto) => void
   closeDrawer: () => void
   drawerVisible: boolean
   selectedEntity: RequestDto | null
   setDeviceHistory_page: (page: number) => void
}

function FixingHistorySection({
   deviceHistory_page,
   api_deviceRequestHistory,
   api_request,
   openDrawer,
   closeDrawer,
   drawerVisible,
   selectedEntity,
   setDeviceHistory_page,
}: FixingHistorySectionProps) {
   return (
      <>
         <Card className="fixing-history mt-4">
            <ProList<RequestDto>
               pagination={{
                  pageSize: 4,
                  current: deviceHistory_page,
                  total: api_deviceRequestHistory.data?.total,
                  onChange: (page) => setDeviceHistory_page(page),
               }}
               className="admin-list-style w-full"
               headerTitle={
                  <div className="mb-3 flex w-full items-center justify-between font-bold">
                     <span>Lịch sử sửa chữa ({api_deviceRequestHistory.data?.total ?? 0})</span>
                  </div>
               }
               showExtra="always"
               dataSource={api_deviceRequestHistory.data?.list}
               loading={api_deviceRequestHistory.isPending}
               metas={{
                  extra: {
                     render: (_: any, entity: RequestDto) => (
                        <div onClick={() => openDrawer(entity)} className="cursor-pointer">
                           <Tooltip title="Click để xem chi tiết">
                              <div className="mb-4 flex justify-between">
                                 <div className="text-black transition-all duration-300 hover:text-blue-500 hover:underline">
                                    {entity.requester_note}
                                 </div>{" "}
                                 <div>
                                    {entity.is_warranty ? (
                                       <Tag color="blue">Bảo hành</Tag>
                                    ) : entity.is_renew ? (
                                       <Tag color="orange">Thay thế</Tag>
                                    ) : (
                                       <Tag color="green">Sửa chữa</Tag>
                                    )}
                                 </div>
                              </div>
                           </Tooltip>
                        </div>
                     ),
                  },
               }}
            />
         </Card>
         <Drawer
            title={`Chi tiết yêu cầu`}
            placement="right"
            width={480}
            onClose={closeDrawer}
            open={drawerVisible}
            styles={{
               body: {
                  padding: 0,
                  overflowX: "hidden",
               },
            }}
            mask={false}
         >
            {selectedEntity && (
               <>
                  <ProDescriptions column={2} bordered>
                     <ProDescriptions.Item label="Lần cập nhật cuối">
                        {dayjs(selectedEntity.updatedAt).format("DD/MM/YYYY HH:mm")}
                     </ProDescriptions.Item>
                     <ProDescriptions.Item label="Người tạo">{selectedEntity.requester.username}</ProDescriptions.Item>
                     <ProDescriptions.Item label="Lý do">{selectedEntity.checker_note}</ProDescriptions.Item>
                  </ProDescriptions>
                  <Collapse
                     className="mt-4"
                     expandIcon={({ isActive }) => (isActive ? <UpOutlined /> : <DownOutlined />)}
                     ghost
                  >
                     {api_request.data?.issues.map((issue: IssueDto) => (
                        <Panel
                           key={issue.id}
                           header={
                              <div className="flex justify-between">
                                 <h2>{issue.typeError.name}</h2>
                                 <Tag
                                    style={{ height: "1.5rem" }}
                                    color={IssueStatusEnumTagMapper[issue.status].colorInverse}
                                 >
                                    {IssueStatusEnumTagMapper[issue.status].text}
                                 </Tag>
                              </div>
                           }
                        >
                           <Card
                              className="mb-4 mt-2"
                              styles={{
                                 body: {
                                    padding: "1rem",
                                 },
                              }}
                           >
                              <ProDescriptions column={1}>
                                 {api_request.data.tasks.map((task: TaskDto) => (
                                    <div key={task.id}>
                                       <div>
                                          <ProDescriptions
                                             dataSource={task}
                                             column={1}
                                             style={{ width: "480px" }}
                                             title={
                                                <div className="flex">
                                                   <h3 className="w-80 overflow-hidden whitespace-normal">
                                                      {task.name}
                                                   </h3>{" "}
                                                   <Tag
                                                      style={{ height: "1.5rem" }}
                                                      color={TaskStatusTagMapper[task.status].colorInverse}
                                                   >
                                                      {TaskStatusTagMapper[task.status].text}
                                                   </Tag>
                                                </div>
                                             }
                                          >
                                             <ProDescriptions.Item label="Thời gian bắt đầu">
                                                {dayjs(task.fixerDate).format("DD/MM/YYYY HH:mm")}
                                             </ProDescriptions.Item>
                                             <ProDescriptions.Item label="Tên nhân viên">
                                                {task.fixer.username}
                                             </ProDescriptions.Item>
                                             <ProDescriptions.Item label="Ghi chú của nhân viên">
                                                {task.fixerNote}
                                             </ProDescriptions.Item>
                                          </ProDescriptions>
                                       </div>
                                       <div className="mt-2">
                                          <h3 className="font-medium">Linh kiện ({issue.issueSpareParts.length})</h3>
                                          <ProList
                                             dataSource={issue.issueSpareParts}
                                             rowKey="id"
                                             className="list-no-padding"
                                             metas={{
                                                title: {
                                                   dataIndex: ["sparePart", "name"],
                                                   render: (_, record) => <a>{record.sparePart.name}</a>,
                                                },
                                                description: {
                                                   dataIndex: "quantity",
                                                   render: (_, record) =>
                                                      `Số lượng: ${record.quantity} (trong kho: ${record.sparePart.quantity})`,
                                                },
                                             }}
                                          />
                                       </div>
                                    </div>
                                 ))}
                              </ProDescriptions>
                           </Card>
                        </Panel>
                     ))}
                  </Collapse>
               </>
            )}
         </Drawer>
      </>
   )
}

export default FixingHistorySection
