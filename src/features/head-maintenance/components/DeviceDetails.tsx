import BackendLocalImage from "@/components/BackendLocalImage"
import ClickableArea from "@/components/ClickableArea"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import hm_uris from "@/features/head-maintenance/uri"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import RequestStatus_Mapper from "@/lib/domain/Request/RequestStatusMapperV2"
import { cn } from "@/lib/utils/cn.util"
import {
   CalendarPlus,
   CaretRight,
   ChartDonut,
   ClockCounterClockwise,
   MapPin,
   Swap,
   Truck,
   Wrench,
} from "@phosphor-icons/react"
import { UseQueryResult } from "@tanstack/react-query"
import { Button, Card, CardProps, Divider, Image, Pagination, Space, Spin, Typography } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { HTMLAttributes, useRef, useState } from "react"
import { RightOutlined } from "@ant-design/icons"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Device_SpecsDrawer, {
   Device_SpecsDrawerProps,
} from "@/features/head-maintenance/components/overlays/Device_Specs.drawer"
import Request_PreviewDrawer, {
   Request_PreviewDrawerProps,
} from "@/features/head-maintenance/components/overlays/Request_Preview.drawer"

type Props = {
   device: DeviceDto
   requestId?: string
} & CardProps

function DeviceDetails(props: Props) {
   const control_deviceSpecsDrawer = useRef<RefType<Device_SpecsDrawerProps>>(null)
   const control_requestPreviewDrawer = useRef<RefType<Request_PreviewDrawerProps>>(null)

   const api_requestHistory = head_maintenance_queries.device.all_requestHistory(
      {
         id: props.device.id,
      },
      {
         select: (data) => {
            let requests = data.requests

            if (props.requestId) {
               requests = requests.filter((request) => request.id !== props.requestId)
            }

            requests = requests.sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix())

            return {
               ...data,
               requests,
            }
         },
      },
   )

   return (
      <Card size="small" {...props}>
         <section className="h-36 w-full rounded-lg border-[1px] border-red-800">
            <Image
               alt="device-image"
               src={props.device.machineModel.image}
               className="h-full w-full object-contain"
               rootClassName="w-full h-full"
            />
         </section>
         <header className="mt-5">
            <p className="text-xs">
               {props.device.deviceCode} - {props.device.machineModel.manufacturer} {props.device.machineModel.yearOfProduction}
            </p>
            <h2 className="text-lg font-semibold">{props.device.machineModel.name}</h2>
         </header>
         <section className="mt-1">
            <Typography.Paragraph
               ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
               className="text-sm text-neutral-500"
            >
               {props.device.description}
            </Typography.Paragraph>
         </section>
         <section className="mt-4 *:text-sm">
            <Divider className="m-0" />
            <ClickableArea reset className="flex py-3">
               <h3 className="font-medium">
                  <MapPin size={14} weight="fill" className="mr-1.5 inline" />
                  Vị trí
               </h3>
               {props.device.isWarranty ? (
                  <p className="ml-auto text-neutral-600">Đang bảo hành</p>
               ) : (
                  <p className="ml-auto text-neutral-600">
                     Khu vực {props.device?.area?.name ?? "-"} ({props.device?.positionX ?? "-"},
                     {props.device?.positionY ?? "-"})
                     <CaretRight size={14} weight="regular" className="ml-1 inline" />
                  </p>
               )}
            </ClickableArea>
            <Divider className="m-0" />
            <div className="flex py-3">
               <h3 className="font-medium">
                  <CalendarPlus size={14} weight="fill" className="mr-1.5 inline" />
                  Ngày nhận máy
               </h3>
               <p className="ml-auto text-neutral-600">
                  {props.device.machineModel.dateOfReceipt
                     ? dayjs(props.device.machineModel.dateOfReceipt).format("DD/MM/YYYY")
                     : "Chưa cập nhật"}
               </p>
            </div>
            <Divider className="m-0" />
            <div className="flex py-3">
               <h3 className="font-medium">
                  <Truck size={14} weight="fill" className="mr-1.5 inline" />
                  Bảo hành
               </h3>
               <p className="ml-auto text-neutral-600">
                  {props.device.machineModel.warrantyTerm
                     ? dayjs(props.device.machineModel.warrantyTerm).format("DD/MM/YYYY")
                     : "Không có"}
               </p>
            </div>
            <Divider className="m-0" />
            <ClickableArea
               reset
               className="flex py-3"
               onClick={() =>
                  control_deviceSpecsDrawer.current?.handleOpen({
                     data: props.device.machineModel,
                  })
               }
            >
               <h3 className="font-medium">
                  <ChartDonut size={14} weight="fill" className="mr-1.5 inline" />
                  Thông số
               </h3>
               <CaretRight size={14} weight="regular" className="ml-auto" />
            </ClickableArea>
            <Divider className="m-0" />
            <div className="flex py-3">
               <h3 className="font-medium">
                  <ClockCounterClockwise size={14} weight="fill" className="mr-1.5 inline" />
                  Lịch sử yêu cầu
               </h3>
               <p className="ml-auto text-neutral-600">
                  {api_requestHistory.isSuccess ? (
                     api_requestHistory.data?.requests.length > 0 ? (
                        <></>
                     ) : (
                        <>Không có yêu cầu</>
                     )
                  ) : (
                     <>
                        {api_requestHistory.isPending && <Spin size="small" />}
                        {api_requestHistory.isError && "Đã xảy ra lỗi"}
                     </>
                  )}
               </p>
            </div>
            {api_requestHistory.isSuccess && (
               <DeviceDetails.HistorySection
                  currentRequestId={props.requestId}
                  api_requestHistory={api_requestHistory}
                  handleOpen_requestPreview={(props) => control_requestPreviewDrawer.current?.handleOpen(props)}
               />
            )}
         </section>
         <OverlayControllerWithRef ref={control_deviceSpecsDrawer}>
            <Device_SpecsDrawer />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_requestPreviewDrawer}>
            <Request_PreviewDrawer />
         </OverlayControllerWithRef>
      </Card>
   )
}

DeviceDetails.pageLimit = 5
DeviceDetails.HistorySection = function DeviceDetailsHistorySection(
   props: {
      api_requestHistory: UseQueryResult<DeviceDto, unknown>
      currentRequestId?: string
      handleOpen_requestPreview: (props: Request_PreviewDrawerProps) => void
   } & HTMLAttributes<HTMLDivElement>,
) {
   const [page, setPage] = useState(0)

   if (props.api_requestHistory.isPending) {
      return <div>Loading...</div>
   }

   if (props.api_requestHistory.isError) {
      return <div>Error</div>
   }

   if (props.api_requestHistory.data.requests.length === 0) {
      return <div></div>
   }

   const renderData = {
      list: props.api_requestHistory.data.requests.slice(
         page * DeviceDetails.pageLimit,
         (page + 1) * DeviceDetails.pageLimit,
      ),
      total: props.api_requestHistory.data.requests.length,
   }

   return (
      <div {...props} className={cn(props.className)}>
         <Space split={<Divider type="horizontal" className="my-1" />} direction="vertical" className="w-full">
            {renderData.list.map((request) => (
               <ClickableArea
                  key={request.id}
                  reset
                  className="flex flex-col text-sm"
                  onClick={() =>
                     props.handleOpen_requestPreview({ request: request, returnToRequest: props.currentRequestId })
                  }
               >
                  <div className="flex w-full items-center text-xs text-neutral-600">
                     <div>{dayjs(request.createdAt).format("DD/MM/YYYY")}</div>
                     <Divider type="vertical" className="mx-2" />
                     <div className={cn(RequestStatus_Mapper(request.status)?.className, "mr-auto")}>
                        {RequestStatus_Mapper(request.status)?.text}
                     </div>
                     <div>
                        {request.is_fix && (
                           <span className="flex items-center gap-1">
                              Sửa chữa <Wrench size={16} weight="fill" />
                           </span>
                        )}
                        {request.is_warranty && (
                           <span className="flex items-center gap-1">
                              Bảo hành <Truck size={16} weight="fill" />
                           </span>
                        )}
                        {request.is_rennew && (
                           <span className="flex items-center gap-1">
                              Thay máy <Swap size={16} weight="fill" />
                           </span>
                        )}
                     </div>
                  </div>
                  <div className="block w-full truncate text-xs text-neutral-600">{request.requester_note}</div>
               </ClickableArea>
            ))}
         </Space>
         {renderData.total > DeviceDetails.pageLimit && (
            <div className="mt-3 flex justify-end">
               <Pagination
                  className="mt-2"
                  current={page}
                  size="small"
                  total={renderData.total}
                  pageSize={DeviceDetails.pageLimit}
                  showSizeChanger={false}
                  onChange={(page) => setPage(page)}
               />
            </div>
         )}
      </div>
   )
}

export default DeviceDetails
