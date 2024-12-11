"use client"

import { PageContainer, ProDescriptions } from "@ant-design/pro-components"
import { Collapse, List, Progress, Space, Steps, Tag, Tooltip, Typography } from "antd"
import admin_queries from "@/features/admin/queries"
import {
   FixRequest_StatusData,
   FixRequest_StatusMapper,
   FixRequestStatuses,
} from "@/lib/domain/Request/RequestStatus.mapper"
import {
   DownOutlined,
   LeftOutlined,
   QrcodeOutlined,
   RightOutlined,
   RobotOutlined,
   TruckFilled,
   UpOutlined,
} from "@ant-design/icons"
import Link from "next/link"
import Card from "antd/es/card"
import Button from "antd/es/button"
import QrCodeV2Modal, { QrCodeV2ModalProps } from "@/features/admin/components/QrCodeV2.modal"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { useRef, useState, useMemo, useEffect } from "react"
import dayjs from "dayjs"
import ProList from "@ant-design/pro-list/lib"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import IssueDetailsModal, { IssueDetailsModalProps } from "@/features/admin/components/IssueDetails.modal"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { useRouter } from "next/navigation"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"
import { cn } from "@/lib/utils/cn.util"
import DeviceDetailsSection from "@/features/admin/components/sections/DeviceDetails.section"
import IssuesListSection from "@/features/admin/components/sections/IssuesList.section"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { Drawer, DrawerProps } from "antd"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { useQuery } from "@tanstack/react-query"
import Admin_Request_OneById from "@/features/admin/api/request/one.api"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"

const { Panel } = Collapse
type QueryState = {
   page: number
   limit: number
   search: {
      status?: any
      priority?: boolean
      name?: string
      fixerDate?: string
      createdAt?: string
      updatedAt?: string
      is_warranty?: string
      fixerName?: string
   }
   order: {
      order?: "ASC" | "DESC"
      orderBy?: string
   }
}

function Page({ params }: { params: { id: string } }) {
   const router = useRouter()

   const [deviceHistory_page, setDeviceHistory_page] = useState(1)
   const api_request = admin_queries.request.one({ id: params.id })
   const api_deviceRequestHistory = admin_queries.request.all_filterAndSort(
      {
         page: deviceHistory_page,
         limit: 4,
         filters: { deviceId: api_request.data?.device.id ?? "" },
      },
      {
         enabled: api_request.isSuccess && api_request.data?.device.id !== undefined,
      },
   )
   const [query, setQuery] = useState<QueryState>({
      page: 1,
      limit: 10,
      search: {
         fixerName: undefined,
      },
      order: {
         order: "DESC",
         orderBy: "updatedAt",
      },
   })

   const control_qrCode = useRef<RefType<QrCodeV2ModalProps> | null>(null)
   const control_issueDetails = useRef<RefType<IssueDetailsModalProps> | null>(null)

   const completionPercentages = useMemo(() => {
      if (!api_request.isSuccess || api_request.data.status !== FixRequestStatus.IN_PROGRESS) return

      const total = api_request.data.issues.length
      const fixed = api_request.data.issues.filter((i) => i.status === IssueStatusEnum.RESOLVED).length
      const failed = api_request.data.issues.filter((i) => i.status === IssueStatusEnum.FAILED).length

      const percentFinished = Math.ceil((fixed / total) * 100)
      const percentFailed = Math.ceil((failed / total) * 100)
      const percentPending = Math.ceil(((total - fixed - failed) / total) * 100)

      return {
         percentFinished,
         percentFailed,
         percentPending,
      }
   }, [api_request.isSuccess, api_request.data])

   const [drawerVisible, setDrawerVisible] = useState(false)
   const [selectedEntity, setSelectedEntity] = useState<RequestDto | null>(null)

   const openDrawer = (entity: RequestDto) => {
      setSelectedEntity(entity)
      setDrawerVisible(true)
   }

   const closeDrawer = () => {
      setDrawerVisible(false)
      setSelectedEntity(null)
   }

   return (
      <>
         <PageContainer
            title="Thông tin yêu cầu"
            backIcon={<LeftOutlined />}
            subTitle={
               <Tag color={FixRequest_StatusMapper(api_request.data).colorInverse}>
                  {FixRequest_StatusMapper(api_request.data).text ?? "-"}
               </Tag>
            }
            breadcrumb={{
               items: [
                  {
                     title: "Yêu cầu",
                  },
                  {
                     title: "Chi tiết",
                  },
                  {
                     title: params.id,
                  },
               ],
            }}
            content={
               <>
                  <Card className="mb-4 mt-2">
                     <ProDescriptions
                        dataSource={api_request.data}
                        loading={api_request.isPending}
                        columns={[
                           {
                              title: "ID",
                              dataIndex: "id",
                           },
                           {
                              title: "Ngày cập nhật",
                              dataIndex: "updatedAt",
                              valueType: "date",
                              render: (_, e) => dayjs(e.updatedAt).format("DD/MM/YYYY HH:mm"),
                           },
                           {},
                           {
                              title: "Ghi chú",
                              dataIndex: "requester_note",
                              render: (text) => <strong>{text}</strong>,
                           },
                           {
                              title: "Người tạo",
                              dataIndex: ["requester", "username"],
                              render: (_, entity) => (
                                 <strong>
                                    <Link href={`/admin/user/${entity.requester.id}`}>{entity.requester.username}</Link>
                                 </strong>
                              ),
                           },
                           {
                              title: "Ngày tạo",
                              dataIndex: "createdAt",
                              valueType: "date",
                              render: (_, e) => <strong>{dayjs(e.createdAt).format("DD/MM/YYYY HH:mm")}</strong>,
                           },
                        ]}
                     />
                  </Card>
                  <Card className="mb-4 mt-2">
                     <Steps
                        current={
                           api_request.isSuccess
                              ? FixRequest_StatusData(api_request.data.status.toLowerCase() as any).index
                              : 0
                        }
                        items={(
                           ["pending", "approved", "in_progress", "head_confirm", "closed"] as FixRequestStatuses[]
                        ).map((status) => ({
                           title: FixRequest_StatusData(status).text,
                           description: (
                              <div className="text-xs text-neutral-500">
                                 {FixRequest_StatusData(status).description}
                              </div>
                           ),
                        }))}
                     />
                     {api_request.isSuccess &&
                        api_request.data.status === FixRequestStatus.IN_PROGRESS &&
                        completionPercentages && (
                           <div className="mt-layout">
                              <Tooltip
                                 title={
                                    <div className="flex flex-col">
                                       <span>Hoàn thành {completionPercentages.percentFinished}%</span>
                                       <span>Thất bại {completionPercentages.percentFailed}%</span>
                                       <span>Chưa thực hiện {completionPercentages.percentPending}%</span>
                                    </div>
                                 }
                              >
                                 <Progress
                                    percent={completionPercentages.percentFinished}
                                    success={{ percent: completionPercentages.percentFailed, strokeColor: "red" }}
                                    strokeColor="green"
                                    showInfo={false}
                                 />
                              </Tooltip>
                           </div>
                        )}
                  </Card>
               </>
            }
            // fixedHeader
            tabProps={{
               animated: {
                  tabPane: true,
                  inkBar: true,
               },
            }}
            tabList={[
               {
                  tab: "Thông tin thiết bị",
                  children: (
                     <>
                        <DeviceDetailsSection device={api_request.data?.device} isLoading={api_request.isPending} />
                        {/* <Card className="mt-4">
                           <ProList
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
                                       <Collapse
                                          className="w-full"
                                          expandIcon={({ isActive }) => (isActive ? <UpOutlined /> : <DownOutlined />)}
                                          ghost
                                       >
                                          <Panel
                                             className="w-full"
                                             key={entity.id}
                                             header={
                                                entity.id === params.id ? (
                                                   <Tooltip title="Đang xem">
                                                      <div className="flex justify-between">
                                                         <div className="font-bold text-black">
                                                            {entity.requester_note}
                                                         </div>
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
                                                ) : (
                                                   <Link href={`/admin/request/${entity.id}`}>
                                                      {entity.requester_note}
                                                   </Link>
                                                )
                                             }
                                          >
                                             <ProDescriptions column={3} bordered>
                                                <ProDescriptions.Item label="Lần cập nhật cuối">
                                                   {dayjs(entity.updatedAt).format("DD/MM/YYYY HH:mm")}
                                                </ProDescriptions.Item>
                                                <ProDescriptions.Item label="Người tạo">
                                                   {entity.requester.username}
                                                </ProDescriptions.Item>
                                                <ProDescriptions.Item label="Lý do">
                                                   {entity.checker_note}
                                                </ProDescriptions.Item>
                                             </ProDescriptions>
                                             <Collapse
                                                className="mt-4"
                                                expandIcon={({ isActive }) =>
                                                   isActive ? <UpOutlined /> : <DownOutlined />
                                                }
                                                ghost
                                             >
                                                {api_tasks.data?.list?.map((task) => (
                                                   <Panel key={task.id} header={task.name}>
                                                      <Card className="mb-4 mt-2">
                                                         <ProDescriptions column={2}>
                                                            <ProDescriptions.Item label="Người sửa">
                                                               {task.fixer?.username}
                                                            </ProDescriptions.Item>
                                                            <ProDescriptions.Item label="Ngày sửa">
                                                               {dayjs(task.fixerDate).format("DD/MM/YYYY HH:mm")}
                                                            </ProDescriptions.Item>
                                                         </ProDescriptions>

                                                      </Card>
                                                   </Panel>
                                                ))}
                                             </Collapse>
                                          </Panel>
                                       </Collapse>
                                    ),
                                 },
                              }}
                           ></ProList>
                        </Card> */}
                        <Card className="mt-4">
                           <ProList
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
                                                <div className="text-black">{entity.requester_note}</div>
                                                <div>
                                                   {entity.is_warranty ? (
                                                      <Tag color="blue">Bảo hành</Tag>
                                                   ) : entity.is_rennew ? (
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
                           width={640}
                           onClose={closeDrawer}
                           visible={drawerVisible}
                        >
                           {selectedEntity && (
                              <>
                                 <ProDescriptions column={2} bordered>
                                    <ProDescriptions.Item label="Lần cập nhật cuối">
                                       {dayjs(selectedEntity.updatedAt).format("DD/MM/YYYY HH:mm")}
                                    </ProDescriptions.Item>
                                    <ProDescriptions.Item label="Người tạo">
                                       {selectedEntity.requester.username}
                                    </ProDescriptions.Item>
                                    <ProDescriptions.Item label="Lý do">
                                       {selectedEntity.checker_note}
                                    </ProDescriptions.Item>
                                 </ProDescriptions>
                                 <Collapse
                                    className="mt-4"
                                    expandIcon={({ isActive }) => (isActive ? <UpOutlined /> : <DownOutlined />)}
                                    ghost
                                 >
                                    {api_request.data?.issues.map((issue: IssueDto) => (
                                       <Panel key={issue.id} header={issue.typeError.name}>
                                          <Card className="mb-4 mt-2">
                                             <ProDescriptions column={2}>
                                                <ProDescriptions.Item label="Loại sửa">
                                                   {issue.fixType}
                                                </ProDescriptions.Item>
                                                <ProDescriptions.Item label="Trạng thái">
                                                   {dayjs(issue.status).format("DD/MM/YYYY HH:mm")}
                                                </ProDescriptions.Item>
                                                <div className="flex">
                                                   <ProDescriptions
                                                      dataSource={issue.task}
                                                      column={1}
                                                      bordered
                                                      size="small"
                                                      columns={[
                                                         {
                                                            title: "Tên tác vụ",
                                                            dataIndex: "name",
                                                            span: 2,
                                                            render: (_, entity) => (
                                                               <Link href={`/admin/task/${entity.id}`}>
                                                                  {entity.name}
                                                               </Link>
                                                            ),
                                                         },
                                                         {
                                                            title: "Trạng thái",
                                                            dataIndex: "status",
                                                            render: (_, record) => (
                                                               <Tag
                                                                  color={
                                                                     TaskStatusTagMapper[record.status].colorInverse
                                                                  }
                                                               >
                                                                  {TaskStatusTagMapper[record.status].text}
                                                               </Tag>
                                                            ),
                                                         },
                                                         {
                                                            title: "Thời gian bắt đầu",
                                                            dataIndex: "fixerDate",
                                                            render: (_, entity) =>
                                                               entity.fixerDate
                                                                  ? dayjs(entity.fixerDate).format("DD/MM/YYYY")
                                                                  : "-",
                                                         },
                                                         {
                                                            title: "Người sửa",
                                                            dataIndex: ["fixer", "username"],
                                                         },
                                                      ]}
                                                   />
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
                                             </ProDescriptions>
                                          </Card>
                                       </Panel>
                                    ))}
                                 </Collapse>
                              </>
                           )}
                        </Drawer>
                     </>
                  ),
               },
               // {
               //    tab: `Danh sách Lỗi máy (${api_request.data?.issues.length ?? 0})`,
               //    children: (
               //       <>
               //          <IssuesListSection issues={api_request.data?.issues} isLoading={api_request.isPending} />
               //       </>
               //    ),
               // },
               {
                  tab: `Danh sách Tác vụ (${api_request.data?.tasks.length ?? 0})`,
                  children: (
                     <Collapse defaultActiveKey={api_request.data?.tasks.map((task) => task.id)}>
                        {api_request.data?.tasks.map((task) => (
                           <Panel
                              key={task.id}
                              header={
                                 <div className="flex items-center justify-between">
                                    <span>{task.name}</span>
                                    <Tag color={TaskStatusTagMapper[task.status]?.colorInverse}>
                                       {TaskStatusTagMapper[task.status]?.text}
                                    </Tag>
                                 </div>
                              }
                           >
                              <Card>
                                 <ProList
                                    className="list-no-padding"
                                    dataSource={task.issues}
                                    metas={{
                                       title: {
                                          dataIndex: ["typeError", "name"],
                                          render: (_, issue) => (
                                             <a onClick={() => console.log("View issue details", issue)}>
                                                {api_request.data.issues[0].typeError.name}
                                             </a>
                                          ),
                                       },
                                       subtitle: {
                                          dataIndex: "fixType",
                                          render: (_: any, issue: { fixType: string }) => (
                                             <Tag color={issue.fixType === "REPAIR" ? "red" : "blue"}>
                                                {issue.fixType === "REPAIR" ? "Sửa chữa" : "Bảo dưỡng"}
                                             </Tag>
                                          ),
                                       },
                                       description: {
                                          dataIndex: "description",
                                       },
                                       actions: {
                                          render: (_, issue) => (
                                             <Steps
                                                type="inline"
                                                current={
                                                   issue.status === IssueStatusEnum.PENDING
                                                      ? 0
                                                      : issue.status === IssueStatusEnum.RESOLVED
                                                        ? 1
                                                        : 2
                                                }
                                                items={[
                                                   { title: "Chưa xử lý", description: "Lỗi chưa được xử lý" },
                                                   { title: "Thành công", description: "Xử lý lỗi thành công" },
                                                   { title: "Thất bại", description: "Xử lý lỗi thất bại" },
                                                ]}
                                             />
                                          ),
                                       },
                                    }}
                                 />
                              </Card>
                           </Panel>
                        ))}
                     </Collapse>
                  ),
               },
               // {
               //    tab: `Linh kiện sử dụng (${spareParts.sparePart?.length ?? "0"})`,
               //    children: (
               //       <>
               //          <Card>
               //             <h3 className="mb-2 text-lg font-bold">Linh kiện sử dụng ({spareParts.length})</h3>
               //             <List
               //                size="small"
               //                dataSource={spareParts}
               //                renderItem={(item) => (
               //                   <List.Item
               //                      className={cn("px-0", item.totalNeeded > item.sparePart.quantity && "bg-yellow-50")}
               //                   >
               //                      <List.Item.Meta
               //                         title={
               //                            <div className="flex items-center justify-between">
               //                               <h4 className="">{item.sparePart.name}</h4>
               //                               <div className="flex gap-2">
               //                                  {item.totalNeeded > item.sparePart.quantity && (
               //                                     <Tag color="yellow-inverse">Không đủ trong kho</Tag>
               //                                  )}
               //                                  <span className="text-neutral-500">(x{item.totalNeeded})</span>
               //                               </div>
               //                            </div>
               //                         }
               //                      />
               //                   </List.Item>
               //                )}
               //             />
               //          </Card>
               //       </>
               //    ),
               // },
            ]}
         ></PageContainer>
         <OverlayControllerWithRef ref={control_qrCode}>
            <QrCodeV2Modal cancelText="Đóng" okText="Tải về" onOk={(e) => {}} />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_issueDetails}>
            <IssueDetailsModal />
         </OverlayControllerWithRef>
      </>
   )
}

export default Page