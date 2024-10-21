"use client"

import { Button, Card, Descriptions, Drawer, DrawerProps, Empty, Tabs, Tag } from "antd"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { CloseOutlined } from "@ant-design/icons"
import head_department_queries from "@/features/head-department/queries"
import CreateRequestDrawer, {
   CreateRequestDrawerProps,
} from "@/features/head-department/components/overlay/CreateRequest.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { useMemo, useRef, useState } from "react"
import Cookies from "js-cookie"
import { decodeJwt } from "@/lib/domain/User/decodeJwt.util"
import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import dayjs from "dayjs"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import AlertCard from "@/components/AlertCard"

type ScanDetailsDrawerProps = {
   device?: DeviceDto
}
type Props = Omit<DrawerProps, "children"> & ScanDetailsDrawerProps

function ScanDetailsDrawer(props: Props) {
   const api_deviceHistory = head_department_queries.device.oneById_withRequests(
      {
         id: props.device?.id ?? "",
      },
      {
         enabled: !!props.device,
      },
   )
   const [tab, setTab] = useState<string>("device-details")

   const cannotCreateRequest = useMemo(() => {
      if (!api_deviceHistory.isSuccess) return

      return api_deviceHistory.data.requests.filter(
         (req) => req.status === FixRequestStatus.PENDING || req.status === FixRequestStatus.IN_PROGRESS,
      )
   }, [api_deviceHistory.data?.requests, api_deviceHistory.isSuccess])

   const control_createRequestDrawer = useRef<RefType<CreateRequestDrawerProps>>(null)

   return (
      <>
         <Drawer
            closeIcon={false}
            title={
               <div className="flex flex-col">
                  <header className="flex items-center gap-1">
                     <Button type="text" icon={<CloseOutlined />} onClick={props.onClose}></Button>
                     <h1>Kết quả quét QR</h1>
                  </header>
                  <Tabs
                     className="test-tabs tabs-no-spacing mt-2 font-normal"
                     type="line"
                     activeKey={tab}
                     onChange={(key) => setTab(key)}
                     items={[
                        {
                           label: "Thông tin thiết bị",
                           key: "device-details",
                        },
                        {
                           label: `Lịch sử sửa chữa (${api_deviceHistory.data?.requests.length ?? "-"})`,
                           key: "repair-history",
                        },
                     ]}
                  />
               </div>
            }
            placement="bottom"
            height="100%"
            classNames={{
               footer: "p-layout",
               header: "pb-0",
            }}
            footer={
               <div>
                  {cannotCreateRequest && cannotCreateRequest?.length > 0 && (
                     <AlertCard
                        text="Thiết bị nãy đã có yêu cầu đang được xử lý. Vui lòng thử lại sau"
                        type="warning"
                        className="mb-3"
                     />
                  )}
                  <Button
                     type="primary"
                     block
                     size="large"
                     onClick={() => control_createRequestDrawer.current?.handleOpen({ device: props.device })}
                     disabled={cannotCreateRequest && cannotCreateRequest?.length > 0}
                  >
                     Tạo yêu cầu mới
                  </Button>
               </div>
            }
            {...props}
         >
            {tab === "device-details" && (
               <div>
                  <Descriptions
                     contentStyle={{
                        display: "flex",
                        justifyContent: "end",
                     }}
                     colon={false}
                     items={[
                        {
                           label: "Mẫu máy",
                           children: props.device?.machineModel.name,
                        },
                        {
                           label: "Khu vực",
                           children: props.device?.area.name,
                        },
                        {
                           label: "Vị trí (x, y)",
                           children: `${props.device?.positionX}, ${props.device?.positionY}`,
                        },
                        {
                           label: "Mô tả",
                           children: props.device?.description,
                        },
                     ]}
                  />
                  <section className="mt-6">
                     <header className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Yêu cầu gần đây</h2>
                     </header>
                     <section className="mt-2">
                        {api_deviceHistory.data?.requests.length === 0 ? (
                           <Card>
                              <Empty description="Không có yêu cầu nào" />
                           </Card>
                        ) : (
                           <div className="flex flex-col gap-1">
                              {api_deviceHistory.data?.requests
                                 .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))
                                 .slice(0, 3)
                                 .map((req) => (
                                    <>
                                       <Card
                                          size="small"
                                          onClick={() => {
                                             const jwt = Cookies.get("token")
                                             if (!jwt) return
                                             const decoded = decodeJwt(jwt)
                                             if (decoded.id === req.requester.id) {
                                                // router.push(`/head/history/${req.id}?return=scan`)
                                             }
                                          }}
                                       >
                                          <div className="flex flex-col gap-2">
                                             <div className="flex items-center justify-between">
                                                <span className="w-64 truncate text-base font-semibold">
                                                   {req.requester.username}
                                                </span>
                                                <Tag color={FixRequest_StatusMapper(req).colorInverse} className="m-0">
                                                   {FixRequest_StatusMapper(req).text}
                                                </Tag>
                                             </div>
                                             <div className="flex justify-between font-normal text-neutral-400">
                                                {req.requester_note}
                                             </div>
                                             <span className="text-xs text-neutral-600">
                                                {dayjs(req.createdAt).add(7, "hours").format("DD-MM-YYYY HH:mm")}
                                             </span>
                                          </div>
                                       </Card>
                                    </>
                                 ))}
                              {api_deviceHistory.isSuccess && api_deviceHistory.data?.requests.length > 3 && (
                                 <Button block type="dashed" onClick={() => setTab("repair-history")}>
                                    Xem tất cả
                                 </Button>
                              )}
                           </div>
                        )}
                     </section>
                  </section>
               </div>
            )}
            {tab === "repair-history" && (
               <div>
                  {api_deviceHistory.data?.requests.map((req) => (
                     <>
                        <Card
                           size="small"
                           onClick={() => {
                              const jwt = Cookies.get("token")
                              if (!jwt) return
                              const decoded = decodeJwt(jwt)
                              if (decoded.id === req.requester.id) {
                                 // router.push(`/head/history/${req.id}?return=scan`)
                              }
                           }}
                        >
                           <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                 <span className="w-64 truncate text-base font-semibold">{req.requester.username}</span>
                                 <Tag color={FixRequest_StatusMapper(req).colorInverse} className="m-0">
                                    {FixRequest_StatusMapper(req).text}
                                 </Tag>
                              </div>
                              <div className="flex justify-between font-normal text-neutral-400">
                                 {req.requester_note}
                              </div>
                              <span className="text-xs text-neutral-600">
                                 {dayjs(req.createdAt).add(7, "hours").format("DD-MM-YYYY HH:mm")}
                              </span>
                           </div>
                        </Card>
                     </>
                  ))}
               </div>
            )}
         </Drawer>
         <OverlayControllerWithRef ref={control_createRequestDrawer}>
            <CreateRequestDrawer />
         </OverlayControllerWithRef>
      </>
   )
}

export default ScanDetailsDrawer
export type { ScanDetailsDrawerProps }
