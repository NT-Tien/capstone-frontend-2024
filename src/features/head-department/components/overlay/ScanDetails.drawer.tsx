"use client"

import AlertCard from "@/components/AlertCard"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import CreateRequestDrawer, {
   CreateRequestDrawerProps,
} from "@/features/head-department/components/overlay/CreateRequest.drawer"
import head_department_queries from "@/features/head-department/queries"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { FixRequest_StatusData } from "@/lib/domain/Request/RequestStatus.mapper"
import { NotFoundError } from "@/lib/error/not-found.error"
import { cn } from "@/lib/utils/cn.util"
import { CalendarOutlined, CloseOutlined, MoreOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons"
import UserOutlined from "@ant-design/icons/UserOutlined"
import { Article, ClockCounterClockwise, Devices, Info, MapPinArea, VectorTwo } from "@phosphor-icons/react"
import { UseQueryResult } from "@tanstack/react-query"
import {
   Badge,
   Button,
   Card,
   Descriptions,
   Divider,
   Drawer,
   DrawerProps,
   Empty,
   Input,
   List,
   Space,
   Tabs,
   Typography,
} from "antd"
import dayjs from "dayjs"
import { useEffect, useMemo, useRef, useState } from "react"

type ScanDetailsDrawerProps = {
   id?: string
}
type Props = Omit<DrawerProps, "children"> &
   ScanDetailsDrawerProps & {
      handleClose?: () => void
   }

function ScanDetailsDrawer(props: Props) {
   const api_device = head_department_queries.device.oneById(
      {
         id: props.id ?? "",
      },
      {
         enabled: !!props.id,
      },
   )

   const api_deviceHistory = head_department_queries.device.oneById_withRequests(
      {
         id: props.id ?? "",
      },
      {
         enabled: !!props.id,
         select: (data) => {
            return {
               ...data,
               requests: data.requests.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt))),
            }
         },
      },
   )
   const [tab, setTab] = useState<string>("device-details")

   const cannotCreateRequest = useMemo(() => {
      if (!api_deviceHistory.isSuccess) return

      return api_deviceHistory.data.requests.filter(
         (req) =>
            req.status === FixRequestStatus.PENDING ||
            req.status === FixRequestStatus.IN_PROGRESS ||
            req.status === FixRequestStatus.APPROVED,
      )
   }, [api_deviceHistory.data?.requests, api_deviceHistory.isSuccess])

   const control_createRequestDrawer = useRef<RefType<CreateRequestDrawerProps>>(null)

   useEffect(() => {
      setTab("device-details")
   }, [])

   return (
      <>
         <Drawer
            closeIcon={false}
            loading={api_device.isPending}
            title={
               <div className="flex flex-col">
                  <header className="flex items-center justify-between gap-1">
                     <Button
                        type="text"
                        className={"text-white"}
                        icon={<CloseOutlined />}
                        onClick={props.onClose}
                     ></Button>
                     <h1>Kết quả quét QR</h1>
                     <Button type="text" className={"text-white"} icon={<MoreOutlined />}></Button>
                  </header>
                  <Tabs
                     className="test-tabs tabs-no-spacing mt-2 font-normal"
                     type="line"
                     activeKey={tab}
                     onChange={(key) => setTab(key)}
                     items={[
                        {
                           label: (
                              <div className="flex items-center justify-center gap-2 text-sm text-white">
                                 <Info size={18} />
                                 Chi tiết
                              </div>
                           ),
                           key: "device-details",
                        },
                        {
                           label: (
                              <div className="flex items-center justify-center gap-2 text-sm text-white">
                                 <ClockCounterClockwise size={18} />
                                 Lịch sử
                                 <Badge count={api_deviceHistory.data?.requests.length} size="small" />
                              </div>
                           ),
                           key: "repair-history",
                        },
                     ]}
                  />
               </div>
            }
            placement="bottom"
            destroyOnClose
            height="100%"
            classNames={{
               footer: "p-layout",
               header: "pb-0 bg-head_department *:text-white",
            }}
            footer={
               api_device.isSuccess && (
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
                        icon={<PlusOutlined />}
                        onClick={() => control_createRequestDrawer.current?.handleOpen({ device: api_device.data })}
                        disabled={cannotCreateRequest && cannotCreateRequest?.length > 0}
                     >
                        Tạo yêu cầu mới
                     </Button>
                  </div>
               )
            }
            {...props}
         >
            {tab === "device-details" && api_device.isSuccess && (
               <div>
                  <Descriptions
                     contentStyle={{
                        display: "flex",
                        justifyContent: "end",
                     }}
                     colon={false}
                     size="small"
                     items={[
                        {
                           label: (
                              <div className="flex items-center gap-2">
                                 <Devices size={18} weight="duotone" />
                                 Mẫu máy
                              </div>
                           ),
                           children: api_device.data?.machineModel.name,
                        },
                        {
                           label: (
                              <div className="flex items-center gap-2">
                                 <MapPinArea size={18} weight="duotone" />
                                 Khu vực
                              </div>
                           ),
                           children: api_device.data?.area?.name ?? "-",
                        },
                        {
                           label: (
                              <div className="flex items-center gap-2">
                                 <VectorTwo size={18} weight="duotone" />
                                 Vị trí
                              </div>
                           ),
                           children: `${api_device.data?.positionX ?? "-"} x ${api_device.data?.positionY ?? "-"}`,
                        },
                        {
                           label: (
                              <div className="flex items-center gap-2">
                                 <Article size={18} weight="duotone" />
                                 Mô tả
                              </div>
                           ),
                           children: (
                              <Typography.Paragraph ellipsis={{ symbol: "Xem nữa", expandable: true, rows: 3 }}>
                                 {api_device.data?.description}
                              </Typography.Paragraph>
                           ),
                        },
                     ]}
                  />
                  <Divider className="my-4" />
                  <section className="">
                     <header className="mb-2 flex items-center justify-center">
                        <h2 className="text-center text-base font-semibold">Yêu cầu gần đây</h2>
                     </header>
                     <section>
                        {api_deviceHistory.data?.requests.length === 0 ? (
                           <Card>
                              <Empty description="Không có yêu cầu nào" />
                           </Card>
                        ) : (
                           <div className="flex flex-col gap-1">
                              <List
                                 dataSource={api_deviceHistory.data?.requests.slice(0, 3)}
                                 renderItem={(item) => (
                                    <List.Item className="items-start gap-2">
                                       <List.Item.Meta
                                          title={<div className="truncate">{item.requester_note}</div>}
                                          description={
                                             <Space
                                                className="text-xs"
                                                size="small"
                                                wrap
                                                split={<Divider type="vertical" className="mx-0" />}
                                             >
                                                <div
                                                   className={cn(
                                                      "flex items-center gap-1",
                                                      FixRequest_StatusData(item.status.toLowerCase() as any).className,
                                                   )}
                                                >
                                                   {FixRequest_StatusData(item.status.toLowerCase() as any).icon}
                                                   {FixRequest_StatusData(item.status.toLowerCase() as any).text}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                   <UserOutlined />
                                                   {item.requester.username}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                   <CalendarOutlined />
                                                   {dayjs(item.createdAt).format("DD/MM/YYYY")}
                                                </div>
                                             </Space>
                                          }
                                       />
                                    </List.Item>
                                 )}
                              />
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
            {tab === "repair-history" && api_device.isSuccess && (
               <RepairHistoryTab api_deviceHistory={api_deviceHistory} />
            )}

            {api_device.isError && api_device.error instanceof NotFoundError && (
               <div className="grid h-full place-items-center">
                  <Empty description="Không tìm thấy thiết bị">
                     <Button type="primary" icon={<ReloadOutlined />} onClick={() => props.handleClose?.()}>
                        Quét lại
                     </Button>
                  </Empty>
               </div>
            )}
         </Drawer>
         <OverlayControllerWithRef ref={control_createRequestDrawer}>
            <CreateRequestDrawer />
         </OverlayControllerWithRef>
      </>
   )
}

type RepairHistoryTabProps = {
   api_deviceHistory: UseQueryResult<DeviceDto, Error>
}

function RepairHistoryTab(props: RepairHistoryTabProps) {
   const [search, setSearch] = useState<string>("")

   const renderList = useMemo(() => {
      if (!props.api_deviceHistory.isSuccess) return []
      if (!search) return props.api_deviceHistory.data?.requests
      return props.api_deviceHistory.data?.requests.filter((req) => {
         if (req.requester.username.includes(search)) return true
         if (req.requester_note.includes(search)) return true
         if (dayjs(req.createdAt).format("DD/MM/YYYY").includes(search)) return true
         return false
      })
   }, [search, props.api_deviceHistory.data?.requests, props.api_deviceHistory.isSuccess])

   useEffect(() => {
      setSearch("")
   }, [])

   return (
      <>
         <Input.Search
            placeholder="Tìm kiếm yêu cầu"
            className="mb-4"
            // value={search}
            // onChange={(e) => setSearch(e.target.value)}
            onSearch={(value) => {
               setSearch(value)
            }}
         />
         <List
            dataSource={renderList}
            loading={props.api_deviceHistory.isPending}
            renderItem={(item, index) => (
               <List.Item className={cn("items-start gap-2", index === 0 && "pt-0")}>
                  <List.Item.Meta
                     title={<div className="truncate">{item.requester_note}</div>}
                     description={
                        <Space
                           className="text-xs"
                           size="small"
                           wrap
                           split={<Divider type="vertical" className="mx-0" />}
                        >
                           <div
                              className={cn(
                                 "flex items-center gap-1",
                                 FixRequest_StatusData(item.status.toLowerCase() as any).className,
                              )}
                           >
                              {FixRequest_StatusData(item.status.toLowerCase() as any).icon}
                              {FixRequest_StatusData(item.status.toLowerCase() as any).text}
                           </div>
                           <div className="flex items-center gap-1">
                              <UserOutlined />
                              {item.requester.username}
                           </div>
                           <div className="flex items-center gap-1">
                              <CalendarOutlined />
                              {dayjs(item.createdAt).format("DD/MM/YYYY")}
                           </div>
                        </Space>
                     }
                  />
               </List.Item>
            )}
         />
      </>
   )
}

export default ScanDetailsDrawer
export type { ScanDetailsDrawerProps }
