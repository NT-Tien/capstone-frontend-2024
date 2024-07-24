"use client"

import RootHeader from "@/common/components/RootHeader"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { ProDescriptions } from "@ant-design/pro-components"
import { CloseOutlined, LeftOutlined, PlusOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { App, Button, Card, Tabs, Tag } from "antd"
import { FixRequestStatus, FixRequestStatusTagMapper } from "@/common/enum/fix-request-status.enum"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import RejectTaskDrawer from "@/app/head-staff/_components/RejectTask.drawer"
import { useTranslation } from "react-i18next"
import React, { ReactNode, useCallback, useRef, useState } from "react"
import { CheckSquareOffset, MapPin, Tray, XCircle } from "@phosphor-icons/react"
import { cn } from "@/common/util/cn.util"
import DataListView from "@/common/components/DataListView"
import ScannerDrawer from "@/common/components/Scanner.drawer"
import { isUUID } from "@/common/util/isUUID.util"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import IssuesList, { IssuesListRefType } from "./IssuesList.component"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"

export default function RequestDetails({ params }: { params: { id: string } }) {
   const router = useRouter()
   const { t } = useTranslation()
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

   function handleScanFinish(result: string) {
      message.destroy("scan-msg")

      if (!api.isSuccess) {
         message.error("Failed to scan device ID. Please try again").then()
         return
      }

      if (!isUUID(result)) {
         message
            .error({
               content: "Invalid device ID",
               key: "scan-msg",
            })
            .then()
         return
      }

      if (api.data.device.id !== result) {
         message
            .error({
               content: "Scanned device ID does not match request details.",
               key: "scan-msg",
            })
            .then()
         return
      }

      setHasScanned(true)
      message
         .success({
            content: "Device ID scanned successfully",
            key: "scan-msg",
         })
         .then()
   }

   return (
      <div className="std-layout">
         <RootHeader
            title="Request Details"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            confirmOnIconClick={hasScanned}
            confirmModalProps={{
               confirmText: "Return",
               title: "Warning",
               description:
                  "You are about to go back. If you have unsaved changes, they will be lost and you'll have to rescan the QR.",
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
                              Request
                           </div>
                        ),
                     },
                     {
                        key: "main-tab-tasks",
                        label: (
                           <div className="flex items-center gap-2">
                              <CheckSquareOffset size={16} />
                              Tasks
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
                     title={<div className="text-base">Request Details</div>}
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
                           title: t("Created"),
                           dataIndex: "createdAt",
                           render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                        },
                        {
                           key: "updatedAt",
                           title: t("LastUpdated"),
                           dataIndex: "updatedAt",
                           render: (_, e) =>
                              e.updatedAt === e.createdAt ? "-" : dayjs(e.updatedAt).format("DD/MM/YYYY - HH:mm"),
                        },
                        {
                           key: "account-name",
                           title: t("ReportedBy"),
                           render: (_, e) => e.requester?.username ?? "-",
                        },
                        {
                           title: "Requester Note",
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
                              Rejection Reason
                           </div>
                        }
                        size="small"
                     >
                        {api.data?.checker_note}
                     </Card>
                  </section>
               )}
               <section className="std-layout-outer mt-6 rounded-lg bg-white py-layout">
                  <h2 className="mb-2 px-layout text-base font-semibold">Device Details</h2>
                  <DataListView
                     dataSource={device.data}
                     bordered
                     itemClassName="py-2"
                     labelClassName="font-normal text-neutral-500 text-[14px]"
                     valueClassName="text-[14px]"
                     items={[
                        {
                           label: "Machine Model",
                           value: (s) => s.machineModel?.name,
                        },
                        {
                           label: "Area",
                           value: (s) => s.area?.name,
                        },
                        {
                           label: "Position (x, y)",
                           value: (s) => (
                              <a className="flex items-center gap-1">
                                 {s.positionX} x {s.positionY}
                                 <MapPin size={16} weight="fill" />
                              </a>
                           ),
                        },
                        {
                           label: "Manufacturer",
                           value: (s) => s.machineModel?.manufacturer,
                        },
                        {
                           label: "Year of Production",
                           value: (s) => s.machineModel?.yearOfProduction,
                        },
                        {
                           label: "Warranty Term",
                           value: (s) => s.machineModel?.warrantyTerm,
                        },
                        {
                           label: "Description",
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
                  className="my-6 mb-32"
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
                                    Reject
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
                              Create First Issue
                           </Button>
                        )}
                        {api.data?.issues.length !== 0 && (
                           <Button
                              type="primary"
                              size="large"
                              icon={<PlusOutlined />}
                              className="flex-grow"
                              onClick={() => router.push(`/head-staff/mobile/requests/${params.id}/task/new`)}
                           >
                              Create Task
                           </Button>
                        )}
                     </section>
                  </RequestDetails.ShowActionByStatus>
               )}
            </>
         )}
         <RequestDetails.ShowActionByStatus
            api={api}
            requiredStatus={[FixRequestStatus.PENDING, FixRequestStatus.APPROVED]}
         >
            <ScannerDrawer onScan={handleScanFinish}>
               {(handleOpen) =>
                  !hasScanned && (
                     <section className="std-layout-outer fixed bottom-0 left-0 w-full justify-center bg-white p-layout shadow-fb">
                        <Button size={"large"} className="w-full" type="primary" onClick={handleOpen}>
                           Scan QR to Continue
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
