"use client"

import { PageContainer, ProDescriptions } from "@ant-design/pro-components"
import { Progress, Steps, Tag, Tooltip } from "antd"
import admin_queries from "@/features/admin/queries"
import {
   FixRequest_StatusData,
   FixRequest_StatusMapper,
   FixRequestStatuses,
} from "@/lib/domain/Request/RequestStatus.mapper"
import { RobotOutlined } from "@ant-design/icons"
import Link from "next/link"
import Card from "antd/es/card"
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

import DeviceDetailsSection from "@/features/admin/components/sections/DeviceDetails.section"
import IssuesListSection from "@/features/admin/components/sections/IssuesList.section"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import FixingHistorySection from "./FixingHistorySection"

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
      <div className="admin-request-drawer flex">
         <PageContainer
            title="Thông tin yêu cầu"
            className={drawerVisible ? "page-container-drawer-open" : "page-container"}
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
                        <FixingHistorySection
                           deviceHistory_page={deviceHistory_page}
                           api_deviceRequestHistory={api_deviceRequestHistory}
                           api_request={api_request}
                           openDrawer={openDrawer}
                           closeDrawer={closeDrawer}
                           drawerVisible={drawerVisible}
                           selectedEntity={selectedEntity}
                           setDeviceHistory_page={setDeviceHistory_page}
                        />
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
      </div>
   )
}

export default Page
