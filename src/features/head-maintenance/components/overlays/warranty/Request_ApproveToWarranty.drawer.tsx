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
import { App, Divider, Drawer, DrawerProps, Input, Space, Typography } from "antd"
import Button from "antd/es/button"
import Form from "antd/es/form"
import dayjs, { Dayjs } from "dayjs"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

type FieldType = {
   note: string
   fixerDate: Dayjs
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

   const [selectedMachineModel, setSelectedMachineModel] = useState<MachineModelDto | null>(null)

   const api_request = head_maintenance_queries.request.one(
      {
         id: props.requestId ?? "",
      },
      {
         enabled: !!props.requestId,
      },
   )

   const mutate_approveToWarranty = head_maintenance_mutations.request.approveToWarranty()

   function handleSubmit(values: FieldType, requestId: string) {
      mutate_approveToWarranty.mutate(
         {
            id: requestId,
            payload: {
               note: values.note,
               isMultiple: props.isMultiple,
               replacement_machineModel_id: selectedMachineModel?.id,
            },
         },
         {
            onSuccess: props.onSuccess,
         },
      )
   }

   useEffect(() => {
      if (!props.open) {
         form.resetFields()
      }
   }, [form, props.open])

   return (
      <>
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
               <Button block type={"primary"} icon={<TruckOutlined />} onClick={form.submit}>
                  Xác nhận
               </Button>
            }
            {...props}
         >
            {api_request.isSuccess && (
               <>
                  <div className="text-base">
                     <section className="flex pb-3">
                        <h3 className="flex items-center gap-1.5 font-medium">
                           <Gear size={18} weight="fill" />
                           Mẫu máy
                        </h3>
                        <p className="ml-auto text-neutral-700">{api_request.data.device.machineModel.name}</p>
                     </section>
                     <Divider className="m-0" />
                     <section className="flex py-3">
                        <h3 className="flex items-center gap-1.5 font-medium">
                           <Factory size={18} weight="fill" />
                           Nhà sản xuất
                        </h3>
                        <p className="ml-auto text-neutral-700">{api_request.data.device.machineModel.manufacturer}</p>
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
                  <Form<FieldType>
                     form={form}
                     layout={"vertical"}
                     onFinish={(values) => props.requestId && handleSubmit(values, props.requestId)}
                  >
                     <div className="mb-3">
                        <h2 className={"flex items-center gap-2 text-lg font-medium"}>
                           <Truck size={18} weight="fill" />
                           Thông tin bảo hành
                        </h2>
                        <p className="text-sm text-neutral-500">Vui lòng nhập thông tin đính kèm phía dưới</p>
                     </div>
                     <section className={"mt-2"}>
                        <Form.Item<FieldType> name={"note"} rules={[{ required: true }]}>
                           <Input.TextArea
                              placeholder="Bảo hành bọc sắt thiết bị do bị gỉ"
                              maxLength={300}
                              showCount
                              allowClear
                              rows={3}
                           />
                        </Form.Item>
                     </section>
                  </Form>
                  <section>
                     <div className="mb-3">
                        <h2 className={"mr-auto flex items-center gap-2 text-lg font-medium"}>
                           <Laptop size={18} weight="fill" />
                           Thiết bị thay thế
                        </h2>
                        <p className="text-sm text-neutral-500">Chọn thiết bị thay thế tạm thời cho nhân viên</p>
                     </div>
                     <div>
                        {selectedMachineModel ? (
                           <div className="relative">
                              <ClickableArea
                                 block
                                 className="block rounded-lg border-[1px] border-red-300 bg-red-100"
                                 type="default"
                                 reset
                                 onClick={() => control_pickMachineModelDrawer.current?.handleOpen({
                                    api_request: api_request
                                 })}
                              >
                                 <div className="flex gap-3 overflow-hidden">
                                    <Image
                                       src={selectedMachineModel.image}
                                       width={80}
                                       height={80}
                                       alt="image"
                                       className="rounded-l-lg"
                                    />
                                    <div className="w-full py-1">
                                       <h1 className="text-base font-medium">{selectedMachineModel.name}</h1>
                                       <Space
                                          split={<Divider type="vertical" className="m-0" />}
                                          wrap
                                          className="mt-1 text-xs"
                                       >
                                          <div className="flex items-center gap-1">
                                             <DeviceTablet size={16} weight="duotone" />
                                             {selectedMachineModel.devices.length}
                                          </div>
                                          <div className="flex items-center gap-1">
                                             <Factory size={16} weight="duotone" />
                                             {selectedMachineModel.manufacturer}
                                          </div>
                                       </Space>
                                       <div className="w-full truncate text-xs text-neutral-500">
                                          {selectedMachineModel.description}
                                       </div>
                                    </div>
                                 </div>
                              </ClickableArea>
                              <Button
                                 type="default"
                                 icon={<DeleteFilled />}
                                 className="absolute right-1 top-1"
                                 danger
                                 onClick={() => setSelectedMachineModel(null)}
                              />
                           </div>
                        ) : (
                           <ClickableArea
                              block
                              className="border-[1px] border-neutral-500 bg-neutral-100 py-2"
                              type="dashed"
                              onClick={() => control_pickMachineModelDrawer.current?.handleOpen({
                                 api_request: api_request
                              })}
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
         <OverlayControllerWithRef ref={control_pickMachineModelDrawer}>
            <PickMachineModelDrawer
               onSubmit={(result) => {
                  setSelectedMachineModel(result)
                  setTimeout(() => {
                     control_pickMachineModelDrawer.current?.handleClose()
                  }, 250)
               }}
               api_request={api_request}
            />
         </OverlayControllerWithRef>
      </>
   )
}

export default Request_ApproveToWarrantyDrawer
export type { Request_ApproveToWarrantyDrawerProps }
