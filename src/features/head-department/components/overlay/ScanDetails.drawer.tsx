"use client"

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
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { CalendarOutlined, CloseOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons"
import head_department_queries from "@/features/head-department/queries"
import CreateRequestDrawer, {
   CreateRequestDrawerProps,
} from "@/features/head-department/components/overlay/CreateRequest.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { useEffect, useMemo, useRef, useState } from "react"
import { FixRequest_StatusData } from "@/lib/domain/Request/RequestStatus.mapper"
import dayjs from "dayjs"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import AlertCard from "@/components/AlertCard"
import UserOutlined from "@ant-design/icons/UserOutlined"
import { cn } from "@/lib/utils/cn.util"
import { Article, ClockCounterClockwise, Devices, Info, MapPinArea, VectorTwo } from "@phosphor-icons/react"
import { UseQueryResult } from "@tanstack/react-query"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

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
                     size="small"
                     items={[
                        {
                           label: (
                              <div className="flex items-center gap-2">
                                 <Devices size={18} weight="duotone" />
                                 Mẫu máy
                              </div>
                           ),
                           children: props.device?.machineModel.name,
                        },
                        {
                           label: (
                              <div className="flex items-center gap-2">
                                 <MapPinArea size={18} weight="duotone" />
                                 Khu vực
                              </div>
                           ),
                           children: props.device?.area?.name ?? "-",
                        },
                        {
                           label: (
                              <div className="flex items-center gap-2">
                                 <VectorTwo size={18} weight="duotone" />
                                 Vị trí
                              </div>
                           ),
                           children: `${props.device?.positionX ?? "-"} x ${props.device?.positionY ?? "-"}`,
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
                                 {props.device?.description}
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
            {tab === "repair-history" && <RepairHistoryTab api_deviceHistory={api_deviceHistory} />}
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
