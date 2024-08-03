"use client"

import RootHeader from "@/common/components/RootHeader"
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query"
import { ProDescriptions } from "@ant-design/pro-components"
import {
   CalendarOutlined,
   CloseOutlined,
   LeftOutlined,
   LinkOutlined,
   PlusOutlined,
   QrcodeOutlined,
} from "@ant-design/icons"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { App, Button, Card, Tabs, Tag } from "antd"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import RejectTaskDrawer from "@/app/head-staff/_components/RejectTask.drawer"
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { CheckSquareOffset, MapPin, Tray, XCircle } from "@phosphor-icons/react"
import { cn } from "@/common/util/cn.util"
import DataListView from "@/common/components/DataListView"
import ScannerDrawer from "@/common/components/Scanner.drawer"
import { isUUID } from "@/common/util/isUUID.util"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import IssuesList, { IssuesListRefType } from "./IssuesList.component"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import TasksList from "@/app/head-staff/mobile/(stack)/requests/[id]/TasksList.tab"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import DeviceRequestHistoryDrawer from "@/app/head-staff/mobile/(stack)/requests/[id]/DeviceRequestHistory.drawer"
import { decodeJwt } from "@/common/util/decodeJwt.util"
import Cookies from "js-cookie"
import { FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"

export default function RequestDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { message, notification } = App.useApp()
   const queryClient = useQueryClient()
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

   const mutate_updateSeen = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
   })
   const mutate_updateChecked = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
   })

   const allHasTasks = useMemo(() => {
      if (!api.isSuccess) return false
      return api.data?.issues.every((issue) => issue.task !== null)
   }, [api.isSuccess, api.data])

   const showFullRequestDetails = useMemo(() => {
      return new Set<any>([FixRequestStatus.APPROVED, FixRequestStatus.IN_PROGRESS, FixRequestStatus.CLOSED]).has(
         api.data?.status,
      )
   }, [api.data?.status])

   async function handleScanFinish(result: string) {
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

      const token = Cookies.get("token")
      if (!token) {
         router.push("/login")
         return
      }
      const tokenPayload = decodeJwt(token)
      const now = dayjs().toISOString()
      await mutate_updateChecked.mutateAsync(
         {
            id: params.id,
            payload: {
               checker: tokenPayload.id,
               checker_date: now,
               status: FixRequestStatus.CHECKED,
            },
         },
         {
            onSuccess: (result) => {
               if (result.checker.id === tokenPayload.id && result.checker_date === now) {
                  setHasScanned(true)
                  message.success({
                     content: "Quét ID thiết bị thành công.",
                     key: "scan-msg",
                  })
                  api.refetch()
               } else {
                  message.error({
                     content: "Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại.",
                  })
               }
            },
            onError: () => {
               message.error({
                  content: "Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại.",
               })
            },
         },
      )
   }

   // notify user if device is out of warranty
   useEffect(() => {
      if (device.isSuccess && device.data) {
         const { machineModel } = device.data
         const warrantyTerm = machineModel.warrantyTerm

         if (warrantyTerm) {
            const now = dayjs()
            const warrantyEnd = dayjs(warrantyTerm)

            if (now.isAfter(warrantyEnd)) {
               notification.destroy("device-warranty-expired")
               notification.warning({
                  message: "Máy đã hết hạn bảo hành.",
                  description: `Máy ${machineModel.name} đã hết hạn bảo hành vào ngày ${warrantyEnd.format("DD/MM/YYYY")}.`,
                  placement: "bottom",
                  key: "device-warranty-expired",
               })
            }
         }
      }
   }, [device.isSuccess, device.data, notification])

   // update seen value in db if user hasn't seen
   useEffect(() => {
      if (api.isSuccess && !api.data.is_seen && mutate_updateSeen.isIdle) {
         mutate_updateSeen.mutate(
            { id: api.data.id, payload: { is_seen: true } },
            {
               onSuccess: async () => {
                  await queryClient.invalidateQueries({
                     queryKey: headstaff_qk.request.all(),
                     exact: false,
                  })
               },
            },
         )
      }
   }, [api.data, api.isSuccess, mutate_updateSeen, queryClient])

   // user only has to scan if request is pending
   useEffect(() => {
      if (api.isSuccess && api.data.status !== FixRequestStatus.PENDING) {
         setHasScanned(true)
      }
   }, [api.data, api.isSuccess])

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
               description: "Bạn có chắc chắn muốn thoát không?",
            }}
            className="std-layout-outer p-4"
         />
         <section className="std-layout-outer">
            {showFullRequestDetails && (
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
            )}
         </section>
         {tab === "main-tab-request" && (
            <>
               <section className={cn(!showFullRequestDetails && "mt-layout")}>
                  <ProDescriptions
                     loading={api.isLoading}
                     dataSource={api.data}
                     size="small"
                     className="flex-grow"
                     title={<div className="text-base">Chi tiết yêu cầu</div>}
                     extra={
                        api.isSuccess && (
                           <Tag
                              color={FixRequest_StatusMapper(api.data).colorInverse}
                              className="mr-0 flex h-full items-center gap-2 px-3"
                           >
                              {FixRequest_StatusMapper(api.data).icon}
                              {FixRequest_StatusMapper(api.data).text}
                           </Tag>
                        )
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
                              Lý do không tiếp nhận
                           </div>
                        }
                        size="small"
                     >
                        {api.data?.checker_note}
                     </Card>
                  </section>
               )}
               <section className="std-layout-outer mt-6 rounded-lg bg-white py-layout">
                  <div className="mb-2 flex items-center justify-between px-layout">
                     <h2 className="text-base font-semibold">Chi tiết thiết bị</h2>
                     <DeviceRequestHistoryDrawer>
                        {(handleOpen) => (
                           <Button
                              type="link"
                              size="small"
                              icon={<CalendarOutlined />}
                              onClick={() => handleOpen(device.data?.id)}
                           >
                              Lịch sử yêu cầu
                           </Button>
                        )}
                     </DeviceRequestHistoryDrawer>
                  </div>
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
                           value: (s) => (
                              <span className="">
                                 <span className="mr-2">{s.machineModel?.warrantyTerm}</span>
                                 {dayjs().isAfter(dayjs(s.machineModel?.warrantyTerm)) && (
                                    <Tag color="red-inverse" className="">
                                       Hết bảo hành
                                    </Tag>
                                 )}
                              </span>
                           ),
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
                     requiredStatus={[
                        FixRequestStatus.PENDING,
                        FixRequestStatus.APPROVED,
                        FixRequestStatus.CHECKED,
                        FixRequestStatus.IN_PROGRESS,
                     ]}
                  >
                     <section className="std-layout-outer fixed bottom-0 left-0 flex w-full items-center justify-center gap-3 bg-white p-layout shadow-fb">
                        <RequestDetails.ShowActionByStatus
                           api={api}
                           requiredStatus={[FixRequestStatus.PENDING, FixRequestStatus.CHECKED]}
                        >
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
                                    Không tiếp nhận
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
                              Tạo vấn đề
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
                        <Button
                           size={"large"}
                           className="w-full"
                           type="primary"
                           onClick={handleOpen}
                           icon={<QrcodeOutlined />}
                        >
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
