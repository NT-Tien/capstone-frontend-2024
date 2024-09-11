"use client"

import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import HeadStaff_Device_OneByIdWithHistory from "@/app/head-staff/_api/device/one-byIdWithHistory.api"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import DataListView from "@/components/DataListView"
import PageHeader from "@/common/components/PageHeader"
import ScannerDrawer from "@/common/components/Scanner.drawer"
import { FixRequest_StatusMapper } from "@/common/dto/status/FixRequest.status"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { TaskStatus } from "@/common/enum/task-status.enum"
import { NotFoundError } from "@/common/error/not-found.error"
import { cn } from "@/common/util/cn.util"
import { isUUID } from "@/common/util/isUUID.util"
import { CheckCircleFilled, MoreOutlined, QrcodeOutlined, TruckFilled } from "@ant-design/icons"
import { Info, MapPin } from "@phosphor-icons/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "antd"
import App from "antd/es/app"
import Button from "antd/es/button"
import Card from "antd/es/card"
import Dropdown from "antd/es/dropdown"
import List from "antd/es/list"
import Result from "antd/es/result"
import Spin from "antd/es/spin"
import Tag from "antd/es/tag"
import dayjs from "dayjs"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ApproveRequestDrawer, { ApproveRequestDrawerRefType } from "./ApproveRequest.drawer"
import DeviceRequestHistoryDrawer from "./DeviceRequestHistory.drawer"
import RejectRequestDrawer, { RejectRequestDrawerRefType } from "./RejectRequest.drawer"
import SendWarrantyDrawer, { SendWarrantyDrawerRefType } from "./SendWarranty.drawer"
import isApproved from "./approved/is-approved.util"

function Page({ params, searchParams }: { params: { id: string }; searchParams: { viewingHistory?: string } }) {
   const router = useRouter()
   const { message, notification } = App.useApp()
   const queryClient = useQueryClient()

   const [hasScanned, setHasScanned] = useState<boolean>(false)

   const rejectRequestRef = useRef<RejectRequestDrawerRefType | null>(null)
   const approveRequestRef = useRef<ApproveRequestDrawerRefType | null>(null)
   const sendWarrantyRef = useRef<SendWarrantyDrawerRefType | null>(null)

   const api_request = useQuery({
      queryKey: headstaff_qk.request.byId(params.id),
      queryFn: () =>
         HeadStaff_Request_OneById({ id: params.id }).then((res) => {
            console.log(res, res === null)
            if (res === null) {
               throw new NotFoundError("Request")
            }
            return res
         }),
   })

   const api_device = useQuery({
      queryKey: headstaff_qk.device.byId(api_request.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: api_request.data?.device.id ?? "" }),
      enabled: api_request.isSuccess,
   })

   const api_deviceHistory = useQuery({
      queryKey: headstaff_qk.device.byIdWithHistory(api_request.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneByIdWithHistory({ id: api_request.data?.device.id ?? "" }),
      select: (data) => data.requests.filter((req) => req.id !== params.id),
      enabled: api_request.isSuccess,
   })

   const mutate_updateSeen = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
   })

   const pageStatus = useMemo(() => {
      if (!api_request.isSuccess) return
      const currentStatus = api_request.data.status

      const canViewTabs = new Set<any>([
         FixRequestStatus.APPROVED,
         FixRequestStatus.IN_PROGRESS,
         FixRequestStatus.HEAD_CONFIRM,
         FixRequestStatus.CLOSED,
      ]).has(currentStatus)

      const hasTaskToCheck =
         api_request.data.tasks.find((task) => task.status === TaskStatus.HEAD_STAFF_CONFIRM) !== undefined

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
         api_request.data.issues.length > 0

      const hasRejected = new Set<any>([FixRequestStatus.REJECTED]).has(currentStatus)

      return {
         hasRejected,
         canViewTabs,
         hasTaskToCheck,
         canViewIssuesList,
         showingApproveRejectButtons,
         canCreateTask,
      }
   }, [
      api_request.data?.issues.length,
      api_request.data?.status,
      api_request.data?.tasks,
      api_request.isSuccess,
      hasScanned,
   ])

   const hasExpired = useMemo(() => {
      if (!api_device.isSuccess) return false
      if (
         api_device.data.machineModel?.warrantyTerm === null ||
         api_device.data.machineModel?.warrantyTerm === undefined
      ) {
         return true
      }
      return dayjs().isAfter(dayjs(api_device.data.machineModel?.warrantyTerm))
   }, [api_device.isSuccess, api_device.data?.machineModel?.warrantyTerm])

   async function handleScanFinish(result: string) {
      message.destroy("scan-msg")

      if (!api_request.isSuccess) {
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

      if (api_request.data.device.id !== result) {
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
         localStorage.setItem(
            `scanned-cache-headstaff`,
            JSON.stringify({
               [params.id]: result,
            }),
         )
      }
   }

   // update seen value in db if user hasn't seen
   useEffect(() => {
      if (api_request.isSuccess && !api_request.data.is_seen && mutate_updateSeen.isIdle) {
         mutate_updateSeen.mutate(
            { id: api_request.data.id, payload: { is_seen: true } },
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
   }, [api_request.data, api_request.isSuccess, mutate_updateSeen, queryClient])

   // user only has to scan if request is pending
   useEffect(() => {
      if (!api_request.isSuccess) return

      if (api_request.data.status !== FixRequestStatus.PENDING) {
         setHasScanned(true)
         return
      }

      const scannedCache = localStorage.getItem(`scanned-cache-headstaff`)
      if (scannedCache) {
         const cache = JSON.parse(scannedCache) as { [key: string]: string }
         if (cache[params.id]?.includes(api_request.data.device.id)) {
            setHasScanned(true)
         }
      }
   }, [api_request.data, api_request.isSuccess, params.id])

   useEffect(() => {
      if (api_request.isSuccess && isApproved(api_request.data.status)) {
         router.push(`/head-staff/mobile/requests/${params.id}/approved`)
      }
   }, [api_request.isSuccess, api_request.data?.status, params.id, router])

   function handleBack() {
      if (searchParams.viewingHistory === "true") {
         router.back()
      } else {
         router.push(`/head-staff/mobile/requests?status=${api_request.data?.status}`)
      }
   }

   return (
      <div className="std-layout relative h-max min-h-full bg-white pb-24">
         <PageHeader
            title={searchParams.viewingHistory === "true" ? "Quay Lại | Yêu cầu" : "Yêu cầu"}
            handleClickIcon={handleBack}
            icon={PageHeader.BackIcon}
            className="std-layout-outer relative z-30"
         />
         <Image
            className="std-layout-outer absolute h-32 w-full object-cover opacity-40"
            src="/images/requests.jpg"
            alt="image"
            width={784}
            height={100}
            style={{
               WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
            }}
         />
         {api_request.isError ? (
            <>
               {api_request.error instanceof NotFoundError ? (
                  <Card>
                     <Result
                        status="404"
                        title="Không tìm thấy yêu cầu"
                        subTitle="Yêu cầu không tồn tại hoặc đã bị xóa"
                        extra={<Button onClick={handleBack}>Quay lại</Button>}
                     />
                  </Card>
               ) : (
                  <Card>
                     <Result
                        status="error"
                        title="Có lỗi xảy ra"
                        subTitle="Vui lòng thử lại sau"
                        extra={[
                           <Button onClick={handleBack} key="back">
                              Quay lại
                           </Button>,
                           <Button onClick={() => api_request.refetch()} key="retry">
                              Thử lại
                           </Button>,
                        ]}
                     />
                  </Card>
               )}
            </>
         ) : (
            <>
               <section className="relative z-50 rounded-lg border-2 border-neutral-200 bg-white shadow-lg">
                  <DataListView
                     bordered
                     dataSource={api_request.data}
                     itemClassName="py-2"
                     labelClassName="font-normal text-neutral-400 text-[14px]"
                     valueClassName="text-[14px] font-medium"
                     items={[
                        {
                           label: "Ngày tạo",
                           value: (e) => dayjs(e.createdAt).add(7, "hours").format("DD/MM/YYYY - HH:mm"),
                        },
                        {
                           label: "Người yêu cầu",
                           value: (e) => e.requester?.username ?? "-",
                        },
                        {
                           label: "Trạng thái",
                           value: (e) => (
                              <Tag className="m-0" color={FixRequest_StatusMapper(e).colorInverse}>
                                 {FixRequest_StatusMapper(e).text}
                              </Tag>
                           ),
                        },
                        {
                           label: "Ghi chú",
                           value: (e) => e.requester_note,
                        },
                     ]}
                  />
               </section>
               {pageStatus?.hasRejected && (
                  <section className="std-layout">
                     <div className="w-full rounded-b-lg bg-red-500 p-3 text-white">
                        <h3 className="text-base font-semibold">Lý do không tiếp nhận</h3>
                        <p className="line-clamp-2 text-sm font-normal">{api_request.data?.checker_note}</p>
                     </div>
                  </section>
               )}
               {api_request.data?.status === FixRequestStatus.APPROVED && (
                  <section className="std-layout">
                     <div className="flex w-full items-start rounded-b-lg bg-primary-500 p-3 text-white">
                        <Info size={32} className="mr-2" />
                        <div className="text-sm font-medium">
                           Yêu cầu đã được xác nhận. Vui lòng tạo tác vụ để tiếp tục.
                        </div>
                     </div>
                  </section>
               )}

               <section className="mt-layout">
                  {api_device.isPending ? (
                     <Skeleton.Button active className="w-1/2 leading-8" />
                  ) : (
                     <h3 className="text-lg font-semibold leading-8 text-neutral-700">THÔNG TIN THIẾT BỊ</h3>
                  )}
                  <div className="rounded-lg border-2 border-neutral-200">
                     <DataListView
                        bordered
                        dataSource={api_device.data}
                        itemClassName="py-2"
                        labelClassName="font-normal text-neutral-400 text-[14px]"
                        valueClassName="text-[14px] font-medium"
                        items={[
                           {
                              label: "Mẫu máy",
                              value: (s) => s.machineModel?.name,
                           },
                           {
                              label: "Nhà sản xuất",
                              value: (s) => s.machineModel?.manufacturer ?? "Không có",
                           },
                           {
                              label: "Năm sản xuất",
                              value: (s) => s.machineModel?.yearOfProduction,
                           },
                           {
                              label: "Ngày nhận máy",
                              value: (s) => s.machineModel?.dateOfReceipt ? dayjs(s.machineModel?.dateOfReceipt).format("DD-MM-YYYY") : "Không có",
                           },
                           {
                              label: "Thời hạn bảo hành",
                              value: (s) =>
                                 s.machineModel.warrantyTerm === null || s.machineModel.warrantyTerm === undefined ? (
                                    <span>Không bảo hành</span>
                                 ) : (
                                    <span className="flex flex-col">
                                       <span className="text-right">
                                          {dayjs(s.machineModel?.warrantyTerm).format("DD-MM-YYYY")}
                                       </span>
                                       {hasExpired && (
                                          <Tag color="red-inverse" className="m-0">
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
                     {api_request.isSuccess && (
                        <section className="mt-layout px-layout">
                           {api_deviceHistory.isSuccess ? (
                              <>
                                 <List
                                    dataSource={api_deviceHistory.data?.slice(0, 2)}
                                    split
                                    header={
                                       <h5 className="text-lg font-medium text-neutral-500">
                                          Lịch sử sửa chữa ({api_deviceHistory.data?.length ?? "-"})
                                       </h5>
                                    }
                                    renderItem={(item, index) => (
                                       <List.Item
                                          className={cn(index === 0 && "mt-1")}
                                          onClick={() => {
                                             if (isApproved(item.status)) {
                                                router.push(
                                                   `/head-staff/mobile/requests/${item.id}/approved?viewingHistory=true`,
                                                )
                                             } else {
                                                router.push(
                                                   `/head-staff/mobile/requests/${item.id}?viewingHistory=true`,
                                                )
                                             }
                                          }}
                                          extra={
                                             <div className="flex flex-col justify-between gap-1">
                                                <div className="text-right">
                                                   {item.is_warranty && <Tag color="orange">Bảo hành</Tag>}
                                                   <Tag
                                                      className="mr-0"
                                                      color={FixRequest_StatusMapper(item).colorInverse}
                                                   >
                                                      {FixRequest_StatusMapper(item).text}
                                                   </Tag>
                                                </div>
                                                <span className="text-right text-neutral-500">
                                                   {dayjs(item.updatedAt).add(7, "hours").format("DD/MM/YYYY")}
                                                </span>
                                             </div>
                                          }
                                       >
                                          <List.Item.Meta
                                             title={item.requester.username}
                                             description={<span className="line-clamp-1">{item.requester_note}</span>}
                                          ></List.Item.Meta>
                                       </List.Item>
                                    )}
                                 />
                                 {api_deviceHistory.data && api_deviceHistory.data?.length > 2 && (
                                    <DeviceRequestHistoryDrawer>
                                       {(handleOpen) => (
                                          <Button
                                             type="dashed"
                                             className="mb-layout w-full"
                                             size="middle"
                                             onClick={() =>
                                                api_device.isSuccess &&
                                                api_request.isSuccess &&
                                                handleOpen(api_device.data.id, api_request.data.id)
                                             }
                                          >
                                             Xem thêm
                                          </Button>
                                       )}
                                    </DeviceRequestHistoryDrawer>
                                 )}
                              </>
                           ) : (
                              <>
                                 {api_deviceHistory.isPending && (
                                    <Card className="mb-layout" size="small">
                                       <Spin>
                                          <div className="flex h-full items-center justify-center">Đang tải...</div>
                                       </Spin>
                                    </Card>
                                 )}
                                 {api_deviceHistory.isError && (
                                    <Card size="small" className="mb-layout">
                                       <Result
                                          status="error"
                                          title="Có lỗi xảy ra"
                                          subTitle="Vui lòng thử lại sau"
                                          extra={<Button onClick={() => api_deviceHistory.refetch()}>Thử lại</Button>}
                                       />
                                    </Card>
                                 )}
                              </>
                           )}
                        </section>
                     )}
                  </div>
               </section>

               <section>
                  <ScannerDrawer onScan={handleScanFinish}>
                     {(handleOpen) =>
                        !hasScanned &&
                        api_request.isSuccess && (
                           <section className="std-layout-outer fixed bottom-0 left-0 w-full justify-center bg-inherit p-layout">
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
                  {pageStatus?.showingApproveRejectButtons && (
                     <section className="std-layout-outer fixed bottom-0 left-0 flex w-full justify-center gap-3 bg-inherit p-layout">
                        {/* <Button
                              size={"large"}
                              className="w-full"
                              type="primary"
                              icon={<CheckCircleFilled />}
                              onClick={() => approveRequestRef.current?.handleOpen(params.id)}
                           >
                              Xác nhận yêu cầu
                           </Button> */}
                        {hasExpired ? (
                           <Button
                              size={"large"}
                              className="w-full"
                              type="primary"
                              icon={<CheckCircleFilled />}
                              onClick={() => approveRequestRef.current?.handleOpen(params.id)}
                           >
                              Xác nhận yêu cầu
                           </Button>
                        ) : (
                           <Button
                              size={"large"}
                              className="w-full bg-yellow-600"
                              type="primary"
                              icon={<TruckFilled />}
                              onClick={() =>
                                 api_device.isSuccess &&
                                 api_request.isSuccess &&
                                 sendWarrantyRef.current?.handleOpen(params.id, api_device.data, {
                                    areaName: api_device.data?.area.name,
                                    createdAt: api_request.data.createdAt,
                                    machineModelName: api_device.data?.machineModel.name,
                                 })
                              }
                           >
                              Gửi bảo hành
                           </Button>
                        )}
                        <Dropdown
                           menu={{
                              items: [
                                 ...(hasExpired === false
                                    ? [
                                         {
                                            key: "continue",
                                            label: "Tiếp tục xử lý",
                                            onClick: () => approveRequestRef.current?.handleOpen(params.id),
                                         },
                                      ]
                                    : []),
                                 {
                                    key: "no-problem",
                                    label: "Thiết bị không có vấn đề?",
                                 },
                                 {
                                    type: "divider",
                                 },
                                 {
                                    key: "reject",
                                    label: "Hủy yêu cầu",
                                    onClick: () => rejectRequestRef.current?.handleOpen(params.id),
                                    danger: true,
                                 },
                              ],
                           }}
                        >
                           <Button size="large" icon={<MoreOutlined />} />
                        </Dropdown>
                     </section>
                  )}
               </section>
            </>
         )}
         <RejectRequestDrawer ref={rejectRequestRef} refetchFn={api_request.refetch} />
         <ApproveRequestDrawer ref={approveRequestRef} refetchFn={api_request.refetch} />
         <SendWarrantyDrawer ref={sendWarrantyRef} params={{ id: params.id }} />
      </div>
   )
}

export default Page
