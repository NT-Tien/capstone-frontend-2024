"use client"

import { PageContainer, ProDescriptions } from "@ant-design/pro-components"
import { List, Progress, Space, Steps, Tag, Tooltip } from "antd"
import admin_queries from "@/features/admin/queries"
import {
   FixRequest_StatusData,
   FixRequest_StatusMapper,
   FixRequestStatuses,
} from "@/lib/domain/Request/RequestStatus.mapper"
import { LeftOutlined, QrcodeOutlined, RightOutlined, RobotOutlined } from "@ant-design/icons"
import Link from "next/link"
import Card from "antd/es/card"
import Button from "antd/es/button"
import QrCodeV2Modal, { QrCodeV2ModalProps } from "@/features/admin/components/QrCodeV2.modal"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { useRef, useState, useMemo } from "react"
import dayjs from "dayjs"
import ProList from "@ant-design/pro-list/lib"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import IssueDetailsModal, { IssueDetailsModalProps } from "@/features/admin/components/IssueDetails.modal"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { useRouter } from "next/navigation"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"
import { cn } from "@/lib/utils/cn.util"
import DeviceDetailsSection from "@/features/admin/components/sections/DeviceDetails.section"
import IssuesListSection from "@/features/admin/components/sections/IssuesList.section"

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

   // const spareParts = useMemo(() => {
   //    if (!api_request.isSuccess || !api_request.data.issues || api_request.data.issues.length === 0) return {}
   //
   //    const returnValue: {
   //       [sparePartId: string]: {
   //          sparePart: SparePartDto
   //          issueSpareParts: IssueSparePartDto[]
   //          totalNeeded: number
   //       }
   //    } = {}
   //
   //    const issueSparePartsList = api_request.data.issues.map((issue) => issue.issueSpareParts).flat()
   //
   //    issueSparePartsList.forEach((issueSparePart) => {
   //       if (!issueSparePart.sparePart) return {}
   //       const currentSparePartId = issueSparePart.sparePart?.id
   //       if (!returnValue[currentSparePartId]) {
   //          returnValue[currentSparePartId] = {
   //             sparePart: issueSparePart.sparePart,
   //             issueSpareParts: [],
   //             totalNeeded: 0,
   //          }
   //       }
   //
   //       const { sparePart, ...issueSparePart_ } = issueSparePart
   //       returnValue[currentSparePartId].issueSpareParts.push(issueSparePart_ as any)
   //       returnValue[currentSparePartId].totalNeeded += issueSparePart.quantity
   //    })
   //
   //    return Object.values(returnValue)
   // }, [api_request.isSuccess, api_request.data?.issues])

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
                  <ProDescriptions
                     dataSource={api_request.data}
                     loading={api_request.isPending}
                     columns={[
                        {
                           title: "ID",
                           dataIndex: "id",
                        },
                        {
                           title: "Ngày tạo",
                           dataIndex: "createdAt",
                           valueType: "date",
                           render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY HH:mm"),
                        },
                        {
                           title: "Ngày cập nhật",
                           dataIndex: "updatedAt",
                           valueType: "date",
                           render: (_, e) => dayjs(e.updatedAt).format("DD/MM/YYYY HH:mm"),
                        },
                        {
                           title: "Ghi chú",
                           dataIndex: "requester_note",
                        },
                        {
                           title: "Người tạo",
                           dataIndex: ["requester", "username"],
                           render: (_, entity) => (
                              <Link href={`/admin/user/${entity.requester.id}`}>{entity.requester.username}</Link>
                           ),
                        },
                     ]}
                  />
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
                        <Card className="mt-4">
                           <ProList
                              pagination={{
                                 pageSize: 4,
                                 current: deviceHistory_page,
                                 total: api_deviceRequestHistory.data?.total,
                                 onChange: (page) => setDeviceHistory_page(page),
                              }}
                              className="list-no-padding"
                              headerTitle={
                                 <div className="mb-3 flex w-full items-center justify-between font-bold">
                                    <span>Lịch sử sửa chữa ({api_deviceRequestHistory.data?.total ?? 0})</span>
                                    {/*<Link href={`/admin/device/${api_request.data?.device.id}`}>*/}
                                    {/*   <Button>Xem chi tiết</Button>*/}
                                    {/*</Link>*/}
                                 </div>
                              }
                              showExtra="always"
                              dataSource={api_deviceRequestHistory.data?.list}
                              loading={api_deviceRequestHistory.isPending}
                              metas={{
                                 title: {
                                    dataIndex: "requester_note",
                                    render: (_, entity) =>
                                       entity.id === params.id ? (
                                          <Tooltip title="Đang xem">
                                             <div className="font-bold text-black hover:text-black">
                                                {entity.requester_note}
                                             </div>
                                          </Tooltip>
                                       ) : (
                                          <Link href={`/admin/request/${entity.id}`}>{entity.requester_note}</Link>
                                       ),
                                 },
                                 description: {
                                    dataIndex: "createdAt",
                                    render: (_, entity) => dayjs(entity.createdAt).format("DD/MM/YYYY HH:mm"),
                                 },
                                 avatar: {
                                    render: (_, entity) => <RobotOutlined />,
                                 },
                                 subTitle: {
                                    dataIndex: ["status"],
                                    render: (_, entity) => (
                                       <Tag color={FixRequest_StatusMapper(entity).color}>
                                          {FixRequest_StatusMapper(entity).text}
                                       </Tag>
                                    ),
                                 },
                              }}
                           ></ProList>
                        </Card>
                     </>
                  ),
               },
               {
                  tab: `Danh sách Lỗi máy (${api_request.data?.issues.length ?? 0})`,
                  children: (
                     <>
                        <IssuesListSection issues={api_request.data?.issues} isLoading={api_request.isPending} />
                     </>
                  ),
               },
               {
                  tab: `Danh sách Tác vụ (${api_request.data?.tasks.length ?? 0})`,
                  children: (
                     <Card>
                        <ProList
                           className="list-no-padding"
                           headerTitle={
                              <div className="mb-3 flex w-full items-center justify-between font-bold">
                                 <span>Danh sách tác vụ ({api_request.data?.tasks.length ?? 0})</span>
                                 {/*<Link href={`/admin/device/${api_request.data?.device.id}`}>*/}
                                 {/*   <Button>Xem chi tiết</Button>*/}
                                 {/*</Link>*/}
                              </div>
                           }
                           showExtra="always"
                           dataSource={api_request.data?.tasks}
                           loading={api_request.isPending}
                           // onItem={(e) => router.push(`/admin/task/${e.id}`)}
                           metas={{
                              title: {
                                 dataIndex: "name",
                                 render: (_, entity) => (
                                    <a onClick={() => router.push(`/admin/task/${entity.id}`)}>{entity.name}</a>
                                 ),
                              },
                              description: {
                                 render: (_, entity) => (
                                    <div className="flex gap-3">
                                       <span>
                                          {entity.fixerDate ? dayjs(entity.fixerDate).format("DD/MM/YYYY") : "-"}
                                       </span>
                                       <span>{entity.fixer?.username ?? "-"}</span>
                                       <span>{entity.priority ? "Ưu tiên" : ""}</span>
                                    </div>
                                 ),
                              },
                              avatar: {
                                 render: (_, entity) => <RobotOutlined />,
                              },
                              subTitle: {
                                 dataIndex: ["status"],
                                 render: (_, entity) => (
                                    <Tag color={TaskStatusTagMapper[entity.status].colorInverse}>
                                       {TaskStatusTagMapper[entity.status].text}
                                    </Tag>
                                 ),
                              },
                           }}
                        />
                     </Card>
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
