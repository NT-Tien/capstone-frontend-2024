import ClickableArea from "@/components/ClickableArea"
import MachineModelComparison from "@/components/MachineModelComparison"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import DeviceDetailsDrawer, {
   DeviceDetailsDrawerProps,
} from "@/features/head-maintenance/components/overlays/Device_Details.drawer"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { DeleteOutlined, DownOutlined, LeftOutlined, RightOutlined, SearchOutlined } from "@ant-design/icons"
import { UseQueryResult } from "@tanstack/react-query"
import { Button, Card, Checkbox, Divider, Drawer, DrawerProps, Empty, Input, Radio, Skeleton } from "antd"
import dayjs from "dayjs"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"

type PickMachineModelDrawerProps = {
   onSubmit?: (device?: DeviceDto) => void
   api_request?: UseQueryResult<RequestDto, Error>
   default_selectedDevice?: DeviceDto
}
type Props = Omit<DrawerProps, "children"> & PickMachineModelDrawerProps

function PickMachineModelDrawer(props: Props) {
   const api_machineModels = head_maintenance_queries.device.all_unused(
      {},
      {
         enabled: props.open,
      },
   )

   const control_deviceDetailsDrawer = useRef<RefType<DeviceDetailsDrawerProps>>(null)

   const [search, setSearch] = useState<string>("")
   const [selectedMachineModel, setSelectedMachineModel] = useState<MachineModelDto | null>(null)
   const [selectedDevice, setSelectedDevice] = useState<DeviceDto | null>(null)

   const renderList = useMemo(() => {
      if (!api_machineModels.isSuccess) return

      let list = api_machineModels.data

      list = list.filter((mm) => mm.devices.length > 0)

      if (search) {
         list = list.filter((mm) => mm.name.toLowerCase().includes(search.toLowerCase()))
      }

      return list
   }, [api_machineModels.data, api_machineModels.isSuccess, search])

   useEffect(() => {
      if (props.open) {
         setSelectedMachineModel(
            api_machineModels.data?.find((i) => i.id === props.default_selectedDevice?.machineModel.id) ?? null,
         )
         setSelectedDevice(props.default_selectedDevice ?? null)
      }
   }, [api_machineModels.data, props.default_selectedDevice, props.open])

   return (
      <>
         <Drawer
            title="Chọn thiết bị thay thế"
            closeIcon={<LeftOutlined />}
            loading={api_machineModels.isPending}
            placement="right"
            destroyOnClose
            width="100%"
            classNames={{
               header: "hidden",
            }}
            {...props}
         >
            <Input
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               addonBefore={<LeftOutlined onClick={props.onClose} />}
               classNames={{}}
               placeholder="Tìm kiếm mẫu máy"
               size="large"
            />
            <div className="mt-6 flex flex-col">
               {!api_machineModels.isSuccess ? (
                  <>
                     {api_machineModels.isPending && (
                        <>
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                           <Skeleton.Button active className="h-24 w-full" />
                        </>
                     )}
                     {api_machineModels.isError && <Card className="">Đã xảy ra lỗi. Vui lòng thử lại</Card>}
                  </>
               ) : renderList!.length > 0 ? (
                  renderList?.map((mm, index, array) => {
                     const isSelected = selectedMachineModel?.id === mm.id

                     return (
                        <>
                           <ClickableArea
                              reset
                              key={mm.id}
                              className={cn(
                                 "flex h-20 items-start justify-start gap-3 bg-neutral-100 p-2.5",
                                 index === 0 && "rounded-t-lg",
                                 index === array.length - 1 && "rounded-b-lg",
                              )}
                              onClick={() => {
                                 setSelectedMachineModel((prev) => (isSelected ? null : mm))
                                 setSelectedDevice(null)
                              }}
                           >
                              <div className="aspect-square h-full flex-shrink-0">
                                 <Image
                                    src={mm.image}
                                    alt={mm.name}
                                    className="aspect-square h-full flex-shrink-0 rounded-lg object-cover"
                                    width={200}
                                    height={200}
                                 />
                              </div>
                              <main>
                                 <header className="flex items-center">
                                    <h1 className="mr-auto line-clamp-1 whitespace-pre-wrap text-sm font-bold">
                                       {mm.name}
                                    </h1>
                                    <DownOutlined
                                       className={cn("text-xs transition-all", isSelected && "rotate-180")}
                                    />
                                 </header>
                                 <p className="line-clamp-1 whitespace-pre-wrap text-xs font-light text-neutral-500">
                                    {mm.description}
                                 </p>
                                 <div className="mt-2 flex">
                                    <div className="flex items-center gap-1 text-sm">x{mm.devices.length}</div>
                                 </div>
                              </main>
                           </ClickableArea>
                           {selectedMachineModel?.id === mm.id && props.api_request?.isSuccess && (
                              <div className="bg-neutral-100 px-2.5 pb-4">
                                 <header className="mt-3">
                                    <h3 className="text-sm font-semibold">Chọn thiết bị trong danh sách sau</h3>
                                 </header>
                                 <main className="mt-2">
                                    <ul className="h-48 w-full space-y-2 overflow-y-auto rounded-t-lg border-[1px] border-gray-300 bg-white p-2">
                                       {selectedMachineModel.devices.map((device) => {
                                          const lastRequest = device.requests
                                             ?.sort((a, b) => {
                                                return dayjs(b.createdAt).diff(dayjs(a.createdAt))
                                             })
                                             .find((req) => req.status !== FixRequestStatus.HEAD_CANCEL)
                                          return (
                                             <>
                                                <div className="flex items-center">
                                                   <li
                                                      key={device.id}
                                                      className="flex flex-grow gap-0 text-sm"
                                                      onClick={() => {
                                                         setSelectedDevice(device)
                                                      }}
                                                   >
                                                      <div className="flex-shrink-0">
                                                         <Radio checked={selectedDevice?.id === device.id} />
                                                      </div>
                                                      <div className="mt-0.5">
                                                         <h4 className="line-clamp-1">{device.id}</h4>
                                                         <p className="mt-1 text-xs text-neutral-500">
                                                            {lastRequest?.createdAt
                                                               ? `Yêu cầu gần nhất: ${dayjs(lastRequest.createdAt).format("DD/MM/YYYY")}`
                                                               : "Chưa có yêu cầu"}
                                                         </p>
                                                      </div>
                                                   </li>
                                                   <Button
                                                      type="dashed"
                                                      size="small"
                                                      className="aspect-square flex-shrink-0"
                                                      icon={<RightOutlined />}
                                                      onClick={() =>
                                                         control_deviceDetailsDrawer.current?.handleOpen({ device })
                                                      }
                                                   />
                                                </div>
                                             </>
                                          )
                                       })}
                                    </ul>
                                 </main>
                                 {!!props.default_selectedDevice &&
                                 !!selectedDevice &&
                                 props.default_selectedDevice.id === selectedDevice.id ? (
                                    <div className="mb-4 flex items-center">
                                       <Button block type="primary" disabled className="rounded-r-none rounded-t-none">
                                          Đã chọn
                                       </Button>
                                       <Button
                                          icon={<DeleteOutlined />}
                                          type="primary"
                                          danger
                                          className="aspect-square rounded-l-none rounded-t-none"
                                          onClick={() => props.onSubmit?.(undefined)}
                                       ></Button>
                                    </div>
                                 ) : (
                                    <Button
                                       block
                                       type="primary"
                                       className="mb-4 rounded-t-none"
                                       onClick={() => props.onSubmit?.(selectedDevice ?? undefined)}
                                       disabled={!selectedDevice}
                                    >
                                       Chọn thiết bị
                                    </Button>
                                 )}
                                 <div className="overflow-x-auto">
                                    <MachineModelComparison
                                       machine_1={selectedMachineModel}
                                       machine_2={props.api_request?.data?.device.machineModel}
                                    />
                                 </div>
                              </div>
                           )}
                           {index !== array.length - 1 && <Divider className="my-0 bg-neutral-300" />}
                        </>
                     )
                  })
               ) : (
                  <Empty
                     description="Không tìm thấy mẫu máy nào trong hệ thống. Vui lòng thử lại sau..."
                     className="col-span-2 mt-4"
                  />
               )}
            </div>
         </Drawer>
         <OverlayControllerWithRef ref={control_deviceDetailsDrawer}>
            <DeviceDetailsDrawer />
         </OverlayControllerWithRef>
      </>
   )
}

export default PickMachineModelDrawer
export type { PickMachineModelDrawerProps }
