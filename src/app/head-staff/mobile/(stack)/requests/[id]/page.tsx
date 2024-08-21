"use client"

import React, { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { App, Button, Card, Modal, Progress, Spin, Tabs, Tag } from "antd"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import { isUUID } from "@/common/util/isUUID.util"
import dayjs from "dayjs"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { CalendarOutlined, LeftOutlined, LinkOutlined, QrcodeOutlined, PlusOutlined } from "@ant-design/icons"
import RootHeader from "@/common/components/RootHeader"
import { ArrowLeft, CaretLeft, CheckSquareOffset, MapPin, Note, Tray, XCircle } from "@phosphor-icons/react"
import { cn } from "@/common/util/cn.util"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { ProDescriptions } from "@ant-design/pro-components"
import { FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"
import DeviceRequestHistoryDrawer from "@/app/head-staff/mobile/(stack)/requests/[id]/DeviceRequestHistory.drawer"
import DataListView from "@/common/components/DataListView"
import IssuesList from "@/app/head-staff/mobile/(stack)/requests/[id]/IssuesList.component"
import ScannerDrawer from "@/common/components/Scanner.drawer"
import CreateIssuesComponent from "@/app/head-staff/mobile/(stack)/requests/[id]/CreateIssues.component"
import TasksList from "./TasksList.tab"
import PageHeader from "@/common/components/PageHeader"
import Image from "next/image"
import { Divider } from "antd"

export default function Page({ params }: { params: { id: string } }) {
   return (
      <>
         <Suspense fallback={<Spin fullscreen />}>
            <Component params={params} />
         </Suspense>
      </>
   )
}

function Component({ params }: { params: { id: string } }) {
   const searchParams = useSearchParams()
   const router = useRouter()
   const { message, notification } = App.useApp()
   const queryClient = useQueryClient()

   const [tab, setTab] = useState<string>("main-tab-request")
   const [hasScanned, setHasScanned] = useState<boolean>(false)
   const [open_warranty, setOpen_warranty] = useState(false)

   const api = useQuery({
      queryKey: headstaff_qk.request.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
   })

   const device = useQuery({
      queryKey: headstaff_qk.device.byId(api.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: api.data?.device.id ?? "" }),
      enabled: api.isSuccess,
   })

   const mutate_updateSeen = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
   })

   const pageStatus = useMemo(() => {
      if (!api.isSuccess) return
      const currentStatus = api.data.status

      const canViewTabs = new Set<any>([
         FixRequestStatus.APPROVED,
         FixRequestStatus.IN_PROGRESS,
         FixRequestStatus.HEAD_CONFIRM,
         FixRequestStatus.CLOSED,
      ]).has(currentStatus)

      const hasTaskToCheck = api.data.tasks.find((task) => task.status === TaskStatus.HEAD_STAFF_CONFIRM) !== undefined

      const canViewIssuesList = new Set<any>([
         FixRequestStatus.APPROVED,
         FixRequestStatus.IN_PROGRESS,
         FixRequestStatus.HEAD_CONFIRM,
         FixRequestStatus.CLOSED,
      ]).has(currentStatus)

      const showingApproveRejectButtons = new Set<any>([FixRequestStatus.PENDING]).has(currentStatus) && hasScanned

      const canCreateTask =
         new Set<any>([FixRequestStatus.APPROVED, FixRequestStatus.IN_PROGRESS]).has(currentStatus) &&
         hasScanned &&
         api.data.issues.length > 0

      return {
         canViewTabs,
         hasTaskToCheck,
         canViewIssuesList,
         showingApproveRejectButtons,
         canCreateTask,
      }
   }, [api.data?.issues.length, api.data?.status, api.data?.tasks, api.isSuccess, hasScanned])

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

      setHasScanned(true)
      message.success("Quét ID thiết bị thành công").then()
      const scannedCache = localStorage.getItem(`scanned-cache-headstaff`)

      if (scannedCache) {
         const cache = JSON.parse(scannedCache) as {
            [requestId: string]: string
         }
         cache[params.id] = result
         localStorage.setItem(`scanned-cache-headstaff`, JSON.stringify(cache))
      } else {
         localStorage.setItem(`scanned-cache-headstaff`, JSON.stringify([result]))
      }
   }

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
      if (!api.isSuccess) return

      if (api.data.status !== FixRequestStatus.PENDING) {
         setHasScanned(true)
         return
      }

      const scannedCache = localStorage.getItem(`scanned-cache-headstaff`)
      if (scannedCache) {
         const cache = JSON.parse(scannedCache) as { [key: string]: string }
         if (cache[params.id]?.includes(api.data.device.id)) {
            setHasScanned(true)
         }
      }
   }, [api.data, api.isSuccess, params.id])

   // notify user if device is out of warranty
   useEffect(() => {
      if (
         api.isSuccess &&
         device.isSuccess &&
         device.data &&
         hasScanned &&
         api.data?.status === FixRequestStatus.PENDING
      ) {
         const { machineModel } = device.data
         const warrantyTerm = machineModel.warrantyTerm

         if (warrantyTerm) {
            const now = dayjs()
            const warrantyEnd = dayjs(warrantyTerm)

            if (now.isBefore(warrantyEnd)) {
               setOpen_warranty(true)
            }
         }
      }
   }, [api.data?.status, api.isSuccess, device.data, device.isSuccess, hasScanned])

   const handleBack = () => {
      router.back()
   }

   return (
      <div className="std-layout relative h-full min-h-full bg-white">
         <PageHeader title="Yêu cầu" handleBack={handleBack} className="std-layout-outer relative z-30" />
         <Image
            className="std-layout-outer absolute h-32 w-full object-cover"
            src="/images/requests.jpg"
            alt="image"
            width={784}
            height={100}
            style={{
               WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               filter: "blur(0px)",
            }}
         />
         <section className="relative z-50">
            <DataListView
               className=""
               bordered
               dataSource={api.data}
               itemClassName="py-2"
               labelClassName="font-normal text-neutral-500 text-base"
               valueClassName="text-base"
               items={[
                  {
                     label: "Ngày tạo",
                     value: (e) => dayjs(e.createdAt).add(7, "hours").format("DD/MM/YYYY - HH:mm"),
                  },
                  {
                     label: "Báo cáo bởi",
                     value: (e) => e.requester?.username ?? "-",
                  },
                  {
                     label: "Trạng thái",
                     value: (e) => e.status,
                  },
                  {
                     label: "Ghi chú",
                     value: (e) => e.requester_note,
                  },
               ]}
            />
         </section>
         <section className="mb-3 mt-5">
            <h1 className="text-[22px] text-base font-medium text-neutral-500">THÔNG TIN THIẾT BỊ</h1>
         </section>
         <section className="">
            <DataListView
               bordered
               dataSource={device.data}
               itemClassName="py-2"
               labelClassName="font-normal text-neutral-500 text-[14px]"
               valueClassName="text-[14px]"
               items={[
                  {
                     label: "Mẫu máy",
                     value: (s) => s.machineModel?.name,
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
                  {
                     isDivider: true,
                     label: "",
                     value: () => null,
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
               ]}
            />
         </section>
         <div>
            {pageStatus?.showingApproveRejectButtons && (
               <section className="mt-6">
                  <CreateIssuesComponent requestId={params.id} />
               </section>
            )}

            {pageStatus?.canViewIssuesList && api.data?.status === FixRequestStatus.PENDING && (
               <IssuesList id={params.id} api={api} device={device} hasScanned={hasScanned} className="my-6 mb-28" />
            )}

            <ScannerDrawer onScan={handleScanFinish}>
               {(handleOpen) =>
                  !hasScanned &&
                  api.isSuccess && (
                     <section className="std-layout-outer fixed bottom-0 left-0 w-full justify-center bg-inherit p-layout">
                        <Button
                           size={"large"}
                           className="w-full"
                           type="primary"
                           style={{ backgroundColor: "#5649ED" }}
                           onClick={handleOpen}
                           icon={<QrcodeOutlined />}
                        >
                           Quét mã QR để tiếp tục
                        </Button>
                     </section>
                  )
               }
            </ScannerDrawer>
         </div>
      </div>
   )
}
