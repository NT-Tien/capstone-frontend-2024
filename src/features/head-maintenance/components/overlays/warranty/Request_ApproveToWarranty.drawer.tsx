import ClickableArea from "@/components/ClickableArea"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import PickMachineModelDrawer, {
   PickMachineModelDrawerProps,
} from "@/features/head-maintenance/components/overlays/PickMachineModel.drawer"
import { Task_AssignFixerModalProps } from "@/features/head-maintenance/components/overlays/Task_AssignFixerV2.drawer"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import {
   CloseOutlined,
   DeleteFilled,
   DeleteOutlined,
   MoreOutlined,
   RightOutlined,
   TruckOutlined,
} from "@ant-design/icons"
import { Calendar, DeviceTablet, Factory, Gavel, Gear, Laptop, Truck } from "@phosphor-icons/react"
import { App, Divider, Drawer, DrawerProps, Input, Space, Tooltip, Typography } from "antd"
import Button from "antd/es/button"
import Form from "antd/es/form"
import axios from "axios"
import dayjs, { Dayjs } from "dayjs"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import Cookies from "js-cookie"
import { cn } from "@/lib/utils/cn.util"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import ImageUploader from "@/components/ImageUploader"
import VideoUploader from "@/components/VideoUploader"
type FieldType = {
   note: string
   fixerDate: Dayjs
   images: string[]
   videos: string[]
}

type Request_ApproveToWarrantyDrawerProps = {
   requestId?: string
   isMultiple?: boolean
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> & Request_ApproveToWarrantyDrawerProps

function Request_ApproveToWarrantyDrawer(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const { modal } = App.useApp()
   const control_pickMachineModelDrawer = useRef<RefType<PickMachineModelDrawerProps>>(null)

   const [selectedDevice, setSelectedDevice] = useState<DeviceDto | null>(null)

   const api_request = head_maintenance_queries.request.one(
      {
         id: props.requestId ?? "",
      },
      {
         enabled: !!props.requestId,
      },
   )

   const api_priority = head_maintenance_queries.device.checkKey(
      {
         areaId: api_request.data?.device.area.id ?? "",
         positionX: api_request.data?.device.positionX.toString() ?? "0",
         positionY: api_request.data?.device.positionY.toString() ?? "0",
      },
      {
         enabled:
            !!api_request.data?.device.area.id &&
            !!api_request.data?.device.positionX &&
            !!api_request.data?.device.positionY,
      },
   )

   const mutate_approveToWarranty = head_maintenance_mutations.request.approveToWarranty()

   function handleSubmit(values: FieldType, requestId: string) {
      modal.confirm({
         title: "Lưu ý",
         content: "Bạn có chắc chắn muốn bảo hành thiết bị này không?",
         closable: true,
         maskClosable: true,
         centered: true,
         okText: "Xác nhận",
         cancelText: "Hủy",
         onOk: () => {
            mutate_approveToWarranty.mutate(
               {
                  id: requestId,
                  payload: {
                     note: values.note,
                     isMultiple: props.isMultiple,
                     replacement_device_id: selectedDevice?.id,
                     initial_images: values.images,
                     initial_video: values.videos[0],
                  },
               },
               {
                  onSuccess: props.onSuccess,
               },
            )
         },
      })
   }

   return (
      <>
         <Form<FieldType>
            form={form}
            layout={"vertical"}
            onFinish={(values) => {
               props.requestId && handleSubmit(values, props.requestId)
            }}
         >
            <Drawer
               title={
                  <div className={"flex w-full items-center justify-between"}>
                     <Button className={"text-white"} icon={<CloseOutlined />} type={"text"} onClick={props.onClose} />
                     <h1 className={"text-lg font-semibold"}>Bảo hành thiết bị</h1>
                     <Button className={"text-white"} icon={<MoreOutlined />} type={"text"} />
                  </div>
               }
               closeIcon={false}
               placement="bottom"
               height="100%"
               width="100%"
               classNames={{
                  footer: "p-layout",
                  header: "bg-head_maintenance text-white *:text-white",
               }}
               loading={api_request.isPending}
               footer={
                  <Form.Item shouldUpdate noStyle className="mb-0">
                     {(values) => {
                        const fieldValues = values.getFieldsValue() as FieldType
                        const disabled =
                           !fieldValues.note ||
                           (fieldValues.images.length === 0 && fieldValues.videos.length === 0) ||
                           !api_request.isSuccess ||
                           selectedDevice === null

                        return (
                           <Button
                              block
                              type={"primary"}
                              icon={<TruckOutlined />}
                              onClick={form.submit}
                              disabled={disabled}
                           >
                              Xác nhận bảo hành
                           </Button>
                        )
                     }}
                  </Form.Item>
               }
               {...props}
            >
               {api_request.isSuccess && (
                  <>
                     <div className="text-base">
                        <section className="flex gap-3 pb-3">
                           <h3 className="flex flex-shrink-0 items-center gap-1.5 font-medium">
                              <Gear size={18} weight="fill" />
                              Mẫu máy
                           </h3>
                           <Tooltip title={api_request.data.device.area.id}>
                              <p className="ml-auto truncate text-neutral-700">{api_request.data.device.area.id}</p>
                           </Tooltip>
                        </section>
                        <Divider className="m-0" />
                        <section className="flex py-3">
                           <h3 className="flex items-center gap-1.5 font-medium">
                              <Factory size={18} weight="fill" />
                              Nhà sản xuất
                           </h3>
                           <p className="ml-auto text-neutral-700">
                              {api_request.data.device.machineModel.manufacturer}
                           </p>
                        </section>
                        <Divider className="m-0" />
                        <section className="flex py-3">
                           <h3 className="flex items-center gap-1.5 font-medium">
                              <Calendar size={18} weight="fill" />
                              Hạn bảo hành
                           </h3>
                           <p className="ml-auto text-neutral-700">
                              {dayjs(api_request.data.device.machineModel.warrantyTerm).format("DD/MM/YYYY")}
                           </p>
                        </section>
                        <Divider className="m-0" />
                        <section className="flex flex-col pt-3">
                           <h3 className="flex items-center gap-1.5 font-medium">
                              <Gavel size={18} weight="fill" />
                              Điều khoản bảo hành
                           </h3>
                           <p className="ml-6 mt-1 line-clamp-2 text-neutral-700">
                              {api_request.data.device.machineModel.description}
                           </p>
                           <a
                              className="ml-6 font-medium text-black underline underline-offset-2"
                              onClick={() => {
                                 modal.info({
                                    title: "Điều khoản bảo hành",
                                    content: <div>{api_request.data.device.machineModel.description}</div>,
                                    centered: true,
                                    maskClosable: true,
                                    closable: true,
                                    footer: false,
                                    height: "90%",
                                 })
                              }}
                           >
                              Xem thêm
                           </a>
                        </section>
                     </div>
                     <Divider className="" />

                     <div className="mb-3">
                        <h2 className={"flex items-center gap-2 text-lg font-medium"}>
                           <Truck size={18} weight="fill" />
                           Thông tin bảo hành
                        </h2>
                        <p className="text-sm text-neutral-500">Vui lòng nhập thông tin phía dưới</p>
                     </div>
                     <section className={"mb-6 mt-2 space-y-4"}>
                        <section>
                           <header className="mb-2">
                              <h3 className="text-base font-medium text-neutral-800">Hình ảnh lỗi máy</h3>
                           </header>
                           <Form.Item name="images" initialValue={[]}>
                              <ImageUploader value={[]} />
                           </Form.Item>
                        </section>
                        <section>
                           <header className="mb-2">
                              <h3 className="text-base font-medium text-neutral-800">Video lỗi máy</h3>
                           </header>
                           <Form.Item name="videos" initialValue={[]}>
                              <VideoUploader value={[]} />
                           </Form.Item>
                        </section>
                        <section>
                           <header className="mb-2">
                              <h3 className="text-base font-medium text-neutral-800">Ghi chú</h3>
                           </header>
                           <Form.Item<FieldType> name={"note"} rules={[{ required: true }]} noStyle>
                              <Input.TextArea
                                 placeholder="Bảo hành bọc sắt thiết bị do bị gỉ"
                                 maxLength={300}
                                 showCount
                                 allowClear
                                 rows={3}
                              />
                           </Form.Item>
                        </section>
                     </section>
                     <section>
                        <div className="mb-3">
                           <h2 className={"mr-auto flex items-center gap-2 text-lg font-medium"}>
                              <Laptop size={18} weight="fill" />
                              Thiết bị thay thế
                           </h2>
                           <p className="text-sm text-neutral-500">Chọn thiết bị thay thế tạm thời cho nhân viên</p>
                        </div>
                        <div>
                           {selectedDevice ? (
                              <div className="relative">
                                 <ClickableArea
                                    reset
                                    key={selectedDevice.id}
                                    className={cn("flex h-20 items-start justify-start gap-3 bg-neutral-100 p-2.5")}
                                    onClick={() =>
                                       control_pickMachineModelDrawer.current?.handleOpen({
                                          api_request: api_request,
                                          default_selectedDevice: selectedDevice,
                                       })
                                    }
                                 >
                                    <div className="aspect-square h-full flex-shrink-0">
                                       <Image
                                          src={selectedDevice.machineModel.image}
                                          alt={selectedDevice.machineModel.name}
                                          className="aspect-square h-full flex-shrink-0 rounded-lg object-cover"
                                          width={200}
                                          height={200}
                                       />
                                    </div>
                                    <main>
                                       <header className="flex items-center">
                                          <h1 className="mr-auto line-clamp-1 whitespace-pre-wrap text-sm font-bold">
                                             {selectedDevice.machineModel.name}
                                          </h1>
                                       </header>
                                       <p className="line-clamp-1 whitespace-pre-wrap text-xs font-light text-neutral-500">
                                          {selectedDevice.machineModel.description}
                                       </p>
                                    </main>
                                 </ClickableArea>
                                 <div className="absolute bottom-0 right-0">
                                    <Button
                                       icon={<DeleteOutlined />}
                                       size="small"
                                       type="primary"
                                       danger
                                       onClick={() => setSelectedDevice(null)}
                                    />
                                 </div>
                              </div>
                           ) : (
                              <ClickableArea
                                 block
                                 className="border-[1px] border-neutral-500 bg-neutral-100 py-2"
                                 type="dashed"
                                 onClick={() =>
                                    control_pickMachineModelDrawer.current?.handleOpen({
                                       api_request: api_request,
                                       default_selectedDevice: selectedDevice ?? undefined,
                                    })
                                 }
                                 icon={<RightOutlined />}
                                 iconPosition="end"
                              >
                                 Chọn thiết bị
                              </ClickableArea>
                           )}
                        </div>
                     </section>
                  </>
               )}
            </Drawer>
         </Form>
         <OverlayControllerWithRef ref={control_pickMachineModelDrawer}>
            <PickMachineModelDrawer
               onSubmit={(result) => {
                  setSelectedDevice(result ?? null)
                  setTimeout(() => {
                     control_pickMachineModelDrawer.current?.handleClose()
                  }, 250)
               }}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default Request_ApproveToWarrantyDrawer
export type { Request_ApproveToWarrantyDrawerProps }
