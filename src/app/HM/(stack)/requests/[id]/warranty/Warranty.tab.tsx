"use client"

import ClickableArea from "@/components/ClickableArea"
import ImageUploader from "@/components/ImageUploader"
import DatePickerDrawer, { DatePickerDrawerProps } from "@/components/overlays/DatePicker.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import VideoUploader from "@/components/VideoUploader"
import DeviceDetailsDrawer, {
   DeviceDetailsDrawerProps,
} from "@/features/head-maintenance/components/overlays/Device_Details.drawer"
import PickMachineModelDrawer, {
   PickMachineModelDrawerProps,
} from "@/features/head-maintenance/components/overlays/PickMachineModel.drawer"
import Request_WarrantyCreateReceiveTask, {
   Request_WarrantyCreateReceiveTaskProps,
} from "@/features/head-maintenance/components/overlays/warranty/Request_WarrantyCreateReceiveTask.drawer"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import { DeviceWarrantyCardStatus } from "@/lib/domain/DeviceWarrantyCard/DeviceWarrantyCardStatus.enum"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import TaskUtil from "@/lib/domain/Task/Task.util"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { EditOutlined, EyeOutlined, FileFilled, InfoCircleFilled, MoreOutlined, PlusOutlined } from "@ant-design/icons"
import { Factory, Swap } from "@phosphor-icons/react"
import { UseQueryResult } from "@tanstack/react-query"
import { App, Button, Divider, Dropdown, Space } from "antd"
import dayjs from "dayjs"
import Image from "next/image"
import { useMemo, useRef } from "react"

type Props = {
   api_request: UseQueryResult<RequestDto, Error>
}

function WarrantyTab(props: Props) {
   const { modal } = App.useApp()

   const control_updateWarrantyReceiveDate = useRef<RefType<DatePickerDrawerProps>>(null)
   const control_pickMachineModelDrawer = useRef<RefType<PickMachineModelDrawerProps>>(null)
   const control_warrantyCreateReceiveTask = useRef<RefType<Request_WarrantyCreateReceiveTaskProps>>(null)
   const control_deviceDetailsDrawer = useRef<RefType<DeviceDetailsDrawerProps>>(null)

   const mutate_addReplacementDevice = head_maintenance_mutations.request.addReplacementDevice()
   const mutate_updateWarrantyReceivalDate = head_maintenance_mutations.request.updateWarrantyReceivalDate()

   const activeWarrantyCard = useMemo(() => {
      if (!props.api_request.isSuccess) return

      const deviceWarrantyCards = props.api_request.data.deviceWarrantyCards
      const sortedByCreatedDate = deviceWarrantyCards?.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))

      return sortedByCreatedDate?.[0]
   }, [props.api_request.data?.deviceWarrantyCards, props.api_request.isSuccess])

   return (
      <div className="p-layout pb-[80px]">
         {props.api_request.data?.temporary_replacement_device ? (
            <div className="mb-layout">
               <div className="w-max rounded-t-lg border-2 border-b-0 border-red-800 bg-neutral-100 px-3 text-left font-semibold text-red-800">
                  Thiết bị thay thế
               </div>
               <div className="flex h-[76px]">
                  <div className="flex w-full flex-grow items-start justify-start gap-3 rounded-bl-lg bg-red-800 p-2">
                     <div className="flex-shrink-0">
                        <Image
                           src={props.api_request.data.temporary_replacement_device.machineModel.image}
                           alt="device-image"
                           width={60}
                           height={60}
                           className="rounded-md"
                        />
                     </div>
                     <div className="flex flex-col text-white">
                        <h3 className="line-clamp-1 whitespace-pre-wrap text-base font-bold">
                           {props.api_request.data.temporary_replacement_device.machineModel.name}
                        </h3>
                        <Space split={<Divider type="vertical" className="m-0" />} className="mt-auto">
                           <div className="text-xs">
                              <Factory size={14} weight="fill" className="mr-1.5 inline" />
                              {props.api_request.data.temporary_replacement_device.machineModel.manufacturer}
                           </div>
                        </Space>
                     </div>
                  </div>
                  <div className="flex h-full flex-shrink-0 flex-col">
                     <Button
                        icon={<EyeOutlined />}
                        className="h-full rounded-l-none rounded-br-none border-red-800"
                        onClick={() =>
                           control_deviceDetailsDrawer.current?.handleOpen({
                              device: props.api_request.data?.temporary_replacement_device,
                              requestId: props.api_request.data?.id,
                           })
                        }
                     ></Button>
                     <Button
                        icon={<EditOutlined />}
                        className="h-full rounded-l-none rounded-tr-none border-red-800"
                     ></Button>
                  </div>
               </div>
            </div>
         ) : (
            <div className="mb-layout">
               <ClickableArea
                  reset
                  className="flex w-full flex-grow items-start justify-start gap-3 rounded-lg bg-red-800 p-2"
                  onClick={() => {
                     control_pickMachineModelDrawer.current?.handleOpen({ api_request: props.api_request })
                  }}
               >
                  <div className="grid aspect-square size-10 flex-shrink-0 place-items-center rounded-md bg-white">
                     <PlusOutlined className="text-xl text-red-800" />
                  </div>
                  <main>
                     <h3 className="mb-0.5 text-sm font-semibold text-white">Chọn thiết bị thay thế</h3>
                     <p className="whitespace-pre-wrap text-xs text-white">Chọn một thiết bị thay thế cho yêu cầu</p>
                  </main>
               </ClickableArea>
            </div>
         )}

         <article className="mb-8">
            <header className="mb-1 flex items-center gap-3">
               <h2 className="whitespace-nowrap text-lg font-bold">
                  <InfoCircleFilled className="mr-1" /> Thông tin lỗi máy
               </h2>
               <div className="h-0.5 w-full bg-neutral-300" />
            </header>
            <main className="space-y-3">
               <section>
                  <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Ghi chú</h3>
                  <p className="text-sm">{activeWarrantyCard?.initial_note}</p>
               </section>
               {activeWarrantyCard?.initial_images && (
                  <section>
                     <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Hình ảnh lỗi</h3>
                     <ImageUploader value={activeWarrantyCard.initial_images} />
                  </section>
               )}
               {activeWarrantyCard?.initial_video && (
                  <section>
                     <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Video lỗi</h3>
                     <VideoUploader value={[activeWarrantyCard.initial_video]} />
                  </section>
               )}
            </main>
         </article>
         {activeWarrantyCard && activeWarrantyCard?.status === DeviceWarrantyCardStatus.WC_REJECTED_ON_ARRIVAL && (
            <article className="mb-8">
               <header className="mb-1 flex items-center gap-3">
                  <h2 className="whitespace-nowrap text-lg font-bold">
                     <FileFilled className="mr-1" /> Lỗi trên đơn gửi
                  </h2>
                  <div className="h-0.5 w-full bg-neutral-300" />
               </header>
               <main className="space-y-3">
                  <section>
                     <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Trạng thái bảo hành</h3>
                     <p className="text-sm">Trung tâm từ chối nhận thiết bị</p>
                  </section>
                  <section>
                     <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Lý do từ chối</h3>
                     <p className="text-sm">{activeWarrantyCard.send_note?.split(":")[1]}</p>
                  </section>
                  <section>
                     <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Ngày thực hiện</h3>
                     <p className="text-sm">{dayjs(activeWarrantyCard.send_date).format("DD/MM/YYYY HH:mm")}</p>
                  </section>
                  <section>
                     <h3 className="mb-1 text-sm font-semibold text-neutral-800">Hình ảnh đơn</h3>
                     <ImageUploader value={activeWarrantyCard.send_bill_image} />
                  </section>
               </main>
            </article>
         )}
         {activeWarrantyCard &&
            activeWarrantyCard?.status !== DeviceWarrantyCardStatus.UNSENT &&
            activeWarrantyCard.status !== DeviceWarrantyCardStatus.WC_REJECTED_ON_ARRIVAL && (
               <article className="mb-8">
                  <header className="mb-1 flex items-center gap-3">
                     <h2 className="whitespace-nowrap text-lg font-bold">
                        <FileFilled className="mr-1" /> Đơn gửi thiết bị
                     </h2>
                     <div className="h-0.5 w-full bg-neutral-300" />
                  </header>
                  <main className="space-y-3">
                     <section>
                        <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Mã đơn bảo hành</h3>
                        <p className="text-sm">{activeWarrantyCard.code}</p>
                     </section>
                     <section>
                        <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Vị trí trung tâm bảo hành</h3>
                        <p className="text-sm">
                           {activeWarrantyCard.wc_name} -{" "}
                           {[
                              activeWarrantyCard.wc_address_1,
                              activeWarrantyCard.wc_address_2,
                              "Phường " + activeWarrantyCard.wc_address_ward,
                              "Quận " + activeWarrantyCard.wc_address_district,
                              activeWarrantyCard.wc_address_city,
                           ].join(", ")}
                        </p>
                     </section>
                     <div className="flex justify-between gap-3">
                        <section>
                           <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Ngày gửi</h3>
                           <p className="text-sm">{dayjs(activeWarrantyCard.send_date).format("DD/MM/YYYY HH:mm")}</p>
                        </section>
                        <section>
                           <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Ngày nhận (dự tính)</h3>
                           <p className="text-sm">{dayjs(activeWarrantyCard.receive_date).format("DD/MM/YYYY")}</p>
                        </section>
                     </div>
                     <div className="flex justify-between gap-3">
                        <section>
                           <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Nhân viện nhận máy</h3>
                           <p className="text-sm">{activeWarrantyCard.wc_receiverName}</p>
                        </section>
                        <section>
                           <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Số điện thoại liên lạc</h3>
                           <p className="text-sm">{activeWarrantyCard.wc_receiverPhone}</p>
                        </section>
                     </div>
                     <section>
                        <h3 className="mb-1 text-sm font-semibold text-neutral-800">Hình ảnh đơn</h3>
                        <ImageUploader value={activeWarrantyCard.send_bill_image} />
                     </section>
                  </main>
               </article>
            )}
         {activeWarrantyCard &&
            (activeWarrantyCard.status === DeviceWarrantyCardStatus.SUCCESS ||
               activeWarrantyCard.status === DeviceWarrantyCardStatus.FAIL) && (
               <article>
                  <header className="mb-1 flex items-center gap-3">
                     <h2 className="whitespace-nowrap text-lg font-bold">
                        <FileFilled className="mr-1" /> Đơn nhận thiết bị
                     </h2>
                     <div className="h-0.5 w-full bg-neutral-300" />
                  </header>
                  <main className="space-y-3">
                     <section>
                        <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Ngày nhận máy</h3>
                        <p className="text-sm">{dayjs(activeWarrantyCard.receive_date).format("DD/MM/YYYY HH:mm")}</p>
                     </section>
                     <section>
                        <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Ghi chú</h3>
                        <p className="text-sm">{activeWarrantyCard.receive_note}</p>
                     </section>
                     <section>
                        <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Trạng thái bảo hành</h3>
                        <p className="text-sm">
                           {activeWarrantyCard.status === DeviceWarrantyCardStatus.SUCCESS
                              ? "Bảo hành thành công"
                              : "Từ chối bảo hành"}
                        </p>
                     </section>
                     <section>
                        <h3 className="mb-1 text-sm font-semibold text-neutral-800">Hình ảnh đơn</h3>
                        <ImageUploader value={activeWarrantyCard.receive_bill_image} />
                     </section>
                  </main>
               </article>
            )}

         {/* Only show if device has been sent AND hasn't created RECEIVE WARRANTY task */}
         {!props.api_request.data?.tasks.find((i) => TaskUtil.isTask_Warranty(i, "receive") && i.status !== TaskStatus.CANCELLED) &&
            activeWarrantyCard?.status === DeviceWarrantyCardStatus.WC_PROCESSING && (
               <footer className="fixed bottom-0 left-0 z-50 flex w-full gap-3 border-t-[1px] border-t-neutral-300 bg-white p-layout">
                  {/* Only enable if hasn't created RECEIVE warranty task AND is 1 DAY before expected return warranty date */}
                  {dayjs(activeWarrantyCard?.receive_date).diff(dayjs(), "day") > 1 ? (
                     <Button block type="primary" disabled className="text-sm">
                        Còn {dayjs(activeWarrantyCard?.receive_date).diff(dayjs(), "day")} ngày tới ngày nhận máy
                     </Button>
                  ) : (
                     <Button
                        block
                        type="primary"
                        onClick={() => {
                           control_warrantyCreateReceiveTask.current?.handleOpen({
                              request: props.api_request.data,
                              expectedReceiveDate: dayjs(activeWarrantyCard?.receive_date),
                           })
                        }}
                        icon={<PlusOutlined />}
                     >
                        Tạo tác vụ nhận máy
                     </Button>
                  )}

                  <Dropdown
                     menu={{
                        items: [
                           {
                              key: "1",
                              label: "Thay đổi ngày nhận máy",
                              icon: <Swap size={16} />,
                              onClick: () =>
                                 control_updateWarrantyReceiveDate.current?.handleOpen({
                                    value: activeWarrantyCard?.receive_date
                                       ? dayjs(activeWarrantyCard?.receive_date)
                                       : undefined,
                                 }),
                           },
                        ],
                     }}
                  >
                     <Button className="aspect-square" type="primary" icon={<MoreOutlined />}></Button>
                  </Dropdown>
               </footer>
            )}
         <OverlayControllerWithRef ref={control_updateWarrantyReceiveDate}>
            <DatePickerDrawer
               bounds={{
                  min: dayjs().startOf("day"),
                  max: dayjs().add(10, "years").endOf("year"),
               }}
               title="Cập nhật ngày nhận máy (dự tính)"
               onSubmit={(date) => {
                  props.api_request.isSuccess &&
                     mutate_updateWarrantyReceivalDate.mutate(
                        {
                           id: props.api_request.data.id,
                           payload: {
                              receivalDate: date.toISOString(),
                           },
                        },
                        {
                           onSuccess: () => {
                              props.api_request.refetch()
                           },
                        },
                     )
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_pickMachineModelDrawer}>
            <PickMachineModelDrawer
               onSubmit={(device) => {
                  const requestId = props.api_request.data?.id
                  if (!requestId) return
                  if (!device) {
                     control_pickMachineModelDrawer.current?.handleClose()
                     return
                  }

                  modal.confirm({
                     title: "Lưu ý",
                     content: "Bạn có chắc chắn thay thiết bị này vào vị trí không?",
                     okText: "Xác nhận",
                     cancelText: "Hủy",
                     centered: true,
                     closable: true,
                     maskClosable: true,
                     onOk: () => {
                        control_pickMachineModelDrawer.current?.handleClose()
                        mutate_addReplacementDevice.mutate(
                           {
                              id: requestId,
                              payload: {
                                 deviceId: device.id,
                              },
                           },
                           {
                              onSuccess: () => {
                                 props.api_request.refetch()
                              },
                           },
                        )
                     },
                  })
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_warrantyCreateReceiveTask}>
            <Request_WarrantyCreateReceiveTask
               onSuccess={() => {
                  props.api_request.refetch()
                  control_warrantyCreateReceiveTask.current?.handleClose()
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_deviceDetailsDrawer}>
            <DeviceDetailsDrawer />
         </OverlayControllerWithRef>
      </div>
   )
}

export default WarrantyTab
