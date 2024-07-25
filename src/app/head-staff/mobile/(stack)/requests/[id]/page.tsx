"use client"

import RootHeader from "@/common/components/RootHeader"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { ProDescriptions } from "@ant-design/pro-components"
import { CloseOutlined, LeftOutlined, LinkOutlined, PlusOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { App, Button, Card, Tabs, Tag } from "antd"
import { FixRequestStatus, FixRequestStatusTagMapper } from "@/common/enum/fix-request-status.enum"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import RejectTaskDrawer from "@/app/head-staff/_components/RejectTask.drawer"
import React, { ReactNode, useMemo, useRef, useState } from "react"
import { CheckSquareOffset, MapPin, Tray, XCircle } from "@phosphor-icons/react"
import { cn } from "@/common/util/cn.util"
import DataListView from "@/common/components/DataListView"
import ScannerDrawer from "@/common/components/Scanner.drawer"
import { isUUID } from "@/common/util/isUUID.util"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import IssuesList, { IssuesListRefType } from "./IssuesList.component"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import TasksList from "@/app/head-staff/mobile/(stack)/requests/[id]/TasksList.component"

export default function RequestDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { message } = App.useApp()
   const lastRefetchTime = useRef<number | null>(0)

   const issuesListRef = useRef<IssuesListRefType | null>(null)

   const [tab, setTab] = useState<string>("main-tab-request")
   const [hasScanned, setHasScanned] = useState<boolean>(false)

   const api = useQuery({
      queryKey: headstaff_qk.request.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
      refetchOnWindowFocus: (query) => {
         const now = Date.now()
         const diff = now - (lastRefetchTime.current ?? 0)
         let ret = diff > 10000
         lastRefetchTime.current = now
         return ret
      },
   })

   const device = useQuery({
      queryKey: headstaff_qk.device.byId(api.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: api.data?.device.id ?? "" }),
      enabled: api.isSuccess,
      refetchOnWindowFocus: (query) => {
         const now = Date.now()
         const diff = now - (lastRefetchTime.current ?? 0)
         let ret = diff > 10000
         lastRefetchTime.current = now
         return ret
      },
   })

   const allHasTasks = useMemo(() => {
      if (!api.isSuccess) return false
      return api.data?.issues.every((issue) => issue.task !== null)
   }, [api.isSuccess, api.data])

   function handleScanFinish(result: string) {
      message.destroy("scan-msg")

      if (!api.isSuccess) {
         message.error("Quét ID thiết bị thất bại. Vui lòng thử lại.").then()
         return
      }

      if (!isUUID(result)) {
         message
            .error({
               content: "ID thiết bị không hợp lệ.",
               key: "scan-msg",
            })
            .then()
         return
      }

      if (api.data.device.id !== result) {
         message
            .error({
               content: "ID thiết bị được quét không khớp.",
               key: "scan-msg",
            })
            .then()
         return
      }

      setHasScanned(true)
      message
         .success({
            content: "Quét ID thiết bị thành công.",
            key: "scan-msg",
         })
         .then()
   }

   return (
      <div className="std-layout">
         <RootHeader
            title="Thông tin chi tiết"
            icon={<LeftOutlined />}
            onIconClick={() => router.push("/head-staff/mobile/requests")}
            confirmOnIconClick={hasScanned}
            confirmModalProps={{
               confirmText: "Quay lại",
               cancelText: "Hủy",
               title: "Lưu ý",
               description:
                  "Bạn đã quét ID thiết bị. Nếu bạn thoát, bạn sẽ mất quyền quản lý yêu cầu này. Bạn có chắc chắn muốn thoát không?",
               closeAfterConfirm: false,
            }}
            className="std-layout-outer p-4"
         />
         {api.data?.status === FixRequestStatus.APPROVED && (
            <section className="std-layout-outer">
               <Tabs
                  className="main-tabs"
                  type="line"
                  activeKey={tab}
                  onChange={(key) => setTab(key)}
                  items={[
                     {
                        key: "main-tab-request",
                        label: (
                           <div className="flex items-center gap-2">
                              <Tray size={16} />
                              Thông tin yêu cầu
                           </div>
                        ),
                     },
                     {
                        key: "main-tab-tasks",
                        label: (
                           <div className="flex items-center gap-2">
                              <CheckSquareOffset size={16} />
                              Tác vụ
                           </div>
                        ),
                     },
                  ]}
               />
            </section>
         )}
         {tab === "main-tab-request" && (
            <>
               <section className={cn(api.data?.status !== FixRequestStatus.APPROVED && "mt-layout")}>
                  <ProDescriptions
                     loading={api.isLoading}
                     dataSource={api.data}
                     size="small"
                     className="flex-grow"
                     title={<div className="text-base">Chi tiết yêu cầu</div>}
                     extra={
                        <Tag
                           color={FixRequestStatusTagMapper[String(api.data?.status)].colorInverse}
                           className="mr-0 grid h-full place-items-center px-3"
                        >
                           {FixRequestStatusTagMapper[String(api.data?.status)].text}
                        </Tag>
                     }
                     columns={[
                        {
                           key: "createdAt",
                           title: "Ngày tạo",
                           dataIndex: "createdAt",
                           render: (_, e) => dayjs(e.createdAt).add(7, "hours").format("DD/MM/YYYY - HH:mm"),
                        },
                        {
                           key: "updatedAt",
                           title: "Cập nhật lần cuối",
                           dataIndex: "updatedAt",
                           render: (_, e) =>
                              e.updatedAt === e.createdAt
                                 ? "-"
                                 : dayjs(e.updatedAt).add(7, "hours").format("DD/MM/YYYY - HH:mm"),
                        },
                        {
                           key: "account-name",
                           title: "Báo cáo bởi",
                           render: (_, e) => e.requester?.username ?? "-",
                        },
                        ...(api.data?.status === FixRequestStatus.APPROVED ||
                        api.data?.status === FixRequestStatus.IN_PROGRESS ||
                        api.data?.status === FixRequestStatus.CLOSED
                           ? [
                                {
                                   key: "tasks",
                                   title: "Số tác vụ",
                                   render: (_: any, e: any) => (
                                      <a onClick={() => setTab("main-tab-tasks")}>
                                         {e.tasks?.length ?? 0}
                                         <LinkOutlined className="ml-1" />
                                      </a>
                                   ),
                                },
                             ]
                           : []),
                        {
                           title: "Ghi chú",
                           dataIndex: ["requester_note"],
                        },
                     ]}
                  />
               </section>
               {api.data?.status === FixRequestStatus.REJECTED && (
                  <section className="mt-3 w-full">
                     <Card
                        title={
                           <div className="flex items-center gap-1">
                              <XCircle size={18} />
                              Lý do từ chối
                           </div>
                        }
                        size="small"
                     >
                        {api.data?.checker_note}
                     </Card>
                  </section>
               )}
               <section className="std-layout-outer mt-6 rounded-lg bg-white py-layout">
                  <h2 className="mb-2 px-layout text-base font-semibold">Chi tiết thiết bị</h2>
                  <DataListView
                     dataSource={device.data}
                     bordered
                     itemClassName="py-2"
                     labelClassName="font-normal text-neutral-500 text-[14px]"
                     valueClassName="text-[14px]"
                     items={[
                        {
                           label: "Mẫu máy",
                           value: (s) => s.machineModel?.name,
                        },
                        {
                           label: "Khu vực",
                           value: (s) => s.area?.name,
                        },
                        {
                           label: "Vị trí (x, y)",
                           value: (s) => (
                              <a className="flex items-center gap-1">
                                 {s.positionX} x {s.positionY}
                                 <MapPin size={16} weight="fill" />
                              </a>
                           ),
                        },
                        {
                           label: "Nhà sản xuất",
                           value: (s) => s.machineModel?.manufacturer,
                        },
                        {
                           label: "Năm sản xuất",
                           value: (s) => s.machineModel?.yearOfProduction,
                        },
                        {
                           label: "Thời hạn bảo hành",
                           value: (s) => s.machineModel?.warrantyTerm,
                        },
                        {
                           label: "Mô tả",
                           value: (s) => s.description,
                        },
                     ]}
                  />
               </section>
               <IssuesList
                  id={params.id}
                  api={api}
                  device={device}
                  hasScanned={hasScanned}
                  className="my-6 mb-28"
                  ref={issuesListRef}
               />
               {hasScanned && (
                  <RequestDetails.ShowActionByStatus
                     api={api}
                     requiredStatus={[FixRequestStatus.PENDING, FixRequestStatus.APPROVED]}
                  >
                     <section className="std-layout-outer sticky bottom-0 left-0 flex w-full items-center justify-center gap-3 bg-white p-layout shadow-fb">
                        <RequestDetails.ShowActionByStatus api={api} requiredStatus={[FixRequestStatus.PENDING]}>
                           <RejectTaskDrawer
                              afterSuccess={async () => {
                                 await api.refetch()
                              }}
                           >
                              {(handleOpen) => (
                                 <Button
                                    danger={true}
                                    type="primary"
                                    size="large"
                                    onClick={() => handleOpen(params.id)}
                                    icon={<CloseOutlined />}
                                 >
                                    Từ chối
                                 </Button>
                              )}
                           </RejectTaskDrawer>
                        </RequestDetails.ShowActionByStatus>
                        {api.data?.issues.length === 0 && (
                           <Button
                              type="primary"
                              size="large"
                              icon={<PlusOutlined />}
                              className="flex-grow"
                              onClick={() => {
                                 issuesListRef.current?.focusCreateIssueBtn()
                                 issuesListRef.current?.openCreateIssueDropdown()
                              }}
                           >
                              Tạo vấn đề đầu tiên
                           </Button>
                        )}
                        {api.data?.issues.length !== 0 && (
                           <Button
                              type="primary"
                              size="large"
                              icon={<PlusOutlined />}
                              className="flex-grow"
                              disabled={allHasTasks}
                              onClick={() => router.push(`/head-staff/mobile/requests/${params.id}/task/new`)}
                           >
                              {allHasTasks ? "Tất cả lỗi đã có tác vụ" : "Tạo tác vụ mới"}
                           </Button>
                        )}
                     </section>
                  </RequestDetails.ShowActionByStatus>
               )}
            </>
         )}
         {tab === "main-tab-tasks" && <TasksList api={api} className="mb-28" />}
         <RequestDetails.ShowActionByStatus
            api={api}
            requiredStatus={[FixRequestStatus.PENDING, FixRequestStatus.APPROVED]}
         >
            <ScannerDrawer onScan={handleScanFinish}>
               {(handleOpen) =>
                  !hasScanned && (
                     <section className="std-layout-outer fixed bottom-0 left-0 w-full justify-center bg-white p-layout shadow-fb">
                        <Button size={"large"} className="w-full" type="primary" onClick={handleOpen}>
                           Quét mã QR để tiếp tục
                        </Button>
                     </section>
                  )
               }
            </ScannerDrawer>
         </RequestDetails.ShowActionByStatus>
      </div>
   )
}

function ShowActionByStatus({
   children,
   requiredStatus,
   api,
}: {
   children: ReactNode
   requiredStatus: FixRequestStatus[]
   api: UseQueryResult<FixRequestDto, Error>
}) {
   if (!api.isSuccess) return null

   if (requiredStatus.includes(api.data.status)) {
      return children
   }
   return null
}

RequestDetails.ShowActionByStatus = ShowActionByStatus
