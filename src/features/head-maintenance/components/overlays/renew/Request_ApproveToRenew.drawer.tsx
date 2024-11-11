import ClickableArea from "@/components/ClickableArea"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import Task_AssignFixerV2Drawer, {
   Task_AssignFixerModalProps,
} from "@/features/head-maintenance/components/overlays/Task_AssignFixerV2.drawer"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { UserDto } from "@/lib/domain/User/User.dto"
import {
   CalendarOutlined,
   CloseOutlined,
   ExclamationCircleFilled,
   MoreOutlined,
   RightOutlined,
   TruckOutlined,
   UserOutlined,
} from "@ant-design/icons"
import { Laptop, Truck } from "@phosphor-icons/react"
import { App, Avatar, Card, DatePicker, Descriptions, Divider, Drawer, DrawerProps, Input, Space } from "antd"
import Button from "antd/es/button"
import Form from "antd/es/form"
import dayjs, { Dayjs } from "dayjs"
import { useEffect, useRef, useState } from "react"

type FieldType = {
   note: string
   fixerDate: Dayjs
}

type Request_ApproveToRenewDrawerProps = {
   requestId?: string
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> & Request_ApproveToRenewDrawerProps

function Request_ApproveToRenewDrawer(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const { modal } = App.useApp()

   const [selectedDate, setSelectedDate] = useState<Date | null>(null)
   const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)
   const [selectedPriority, setSelectedPriority] = useState<boolean>(false)

   const control_taskAssignFixerModal = useRef<RefType<Task_AssignFixerModalProps>>(null)

   const api_request = head_maintenance_queries.request.one(
      {
         id: props.requestId ?? "",
      },
      {
         enabled: !!props.requestId,
      },
   )

   const mutate_approveToWarranty = head_maintenance_mutations.request.approveToWarranty()

   function handleSubmit(
      values: FieldType,
      selectedDate: Date,
      selectedUserId: string,
      selectedPriority: boolean,
      requestId: string,
   ) {
      mutate_approveToWarranty.mutate(
         {
            id: requestId,
            payload: {
               note: values.note,
               fixerDate: selectedDate.toISOString(),
               fixer: selectedUserId,
               priority: selectedPriority,
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
         setSelectedDate(null)
         setSelectedUser(null)
         setSelectedPriority(false)
      }
   }, [form, props.open])

   return (
      <Drawer
         title={
            <div className={"flex w-full items-center justify-between"}>
               <Button className={"text-white"} icon={<CloseOutlined />} type={"text"} onClick={props.onClose} />
               <h1 className={"text-lg font-semibold"}>Xác nhận bảo hành</h1>
               <Button className={"text-white"} icon={<MoreOutlined />} type={"text"} />
            </div>
         }
         closeIcon={false}
         placement="bottom"
         height="max-content"
         width="100%"
         classNames={{
            footer: "p-layout",
            header: "bg-head_maintenance text-white *:text-white",
         }}
         loading={api_request.isPending}
         footer={
            <Button block type={"primary"} size={"large"} icon={<TruckOutlined />} onClick={form.submit}>
               Xác nhận
            </Button>
         }
         {...props}
      >
         {api_request.isSuccess && (
            <>
               <section>
                  <div className={"mb-2 flex justify-between"}>
                     <h2 className={"flex items-center gap-2 text-lg font-medium"}>
                        <Laptop size={18} weight="fill" />
                        Chi tiết thiết bị
                     </h2>
                  </div>
                  <Descriptions
                     contentStyle={{
                        display: "flex",
                        justifyContent: "flex-end",
                     }}
                     colon={false}
                     size={"small"}
                     items={[
                        {
                           label: "Mẫu máy",
                           children: api_request.data.device.machineModel.name,
                        },
                        {
                           label: "Nhà sản xuất",
                           children: api_request.data.device.machineModel.manufacturer,
                        },
                        {
                           label: "Năm sản xuất",
                           children: api_request.data.device.machineModel.yearOfProduction,
                        },
                        {
                           label: "Hạn bảo hành",
                           children: dayjs(api_request.data.device.machineModel.warrantyTerm).format("DD/MM/YYYY"),
                        },
                        {
                           label: "Điều khoản bảo hành",
                           children: (
                              <Card
                                 className={"mt-2 w-full border-[1px] border-green-700 text-neutral-500"}
                                 size={"small"}
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
                                 <div className="line-clamp-3 h-full w-full">
                                    {api_request.data.device.machineModel.description}
                                 </div>
                              </Card>
                           ),
                           className: "*:flex-col",
                        },
                     ]}
                  />
               </section>
               <Divider className="" />
               <Form<FieldType>
                  form={form}
                  layout={"vertical"}
                  onFinish={(values) =>
                     props.requestId &&
                     selectedDate &&
                     selectedUser &&
                     handleSubmit(values, selectedDate, selectedUser.id, selectedPriority, props.requestId)
                  }
               >
                  <div className="mb-3">
                     <h2 className={"flex items-center gap-2 text-lg font-medium"}>
                        <Truck size={18} weight="fill" />
                        Thông tin bảo hành
                     </h2>
                     <p className="text-sm text-neutral-500">Vui lòng điền các thông tin phía dưới...</p>
                  </div>
                  <section>
                     <div className="mb-2 flex justify-between">
                        <h2 className={"font-base text-base text-neutral-500"}>Nhân viên bảo hành</h2>
                     </div>
                     {selectedUser && selectedDate ? (
                        <ClickableArea
                           className="w-full justify-start p-3"
                           onClick={() =>
                              control_taskAssignFixerModal.current?.handleOpen({
                                 // recommendedFixerIds: ["e16131f3-957f-421d-8a5e-1428f83dd58c"],
                                 defaults: {
                                    date: selectedDate,
                                    fixer: selectedUser,
                                    priority: selectedPriority ? "priority" : "normal",
                                 },
                              })
                           }
                        >
                           <div className="flex w-full gap-4">
                              <Avatar className="aspect-square h-full bg-green-700">
                                 {selectedUser.username.at(0)}
                              </Avatar>
                              <div className="flex w-full flex-col items-start">
                                 <header className="flex w-full justify-between">
                                    <h3 className="font-semibold">{selectedUser.username}</h3>
                                    <RightOutlined className="text-sm" />
                                 </header>
                                 <Space
                                    split={<Divider type="vertical" className="m-0" />}
                                    wrap
                                    className="mt-1 text-sm"
                                 >
                                    {selectedPriority && (
                                       <p className="flex items-center gap-2 text-red-500">
                                          <ExclamationCircleFilled />
                                          Ưu tiên
                                       </p>
                                    )}
                                    <p className="flex items-center gap-2">
                                       <CalendarOutlined />
                                       {dayjs(selectedDate).format("DD/MM/YYYY")}
                                    </p>
                                 </Space>
                              </div>
                           </div>
                        </ClickableArea>
                     ) : (
                        <ClickableArea
                           block
                           className="h-12"
                           icon={<UserOutlined />}
                           onClick={() =>
                              control_taskAssignFixerModal.current?.handleOpen({
                                 // recommendedFixerIds: ["e16131f3-957f-421d-8a5e-1428f83dd58c"],
                              })
                           }
                        >
                           Chọn nhân viên và ngày bảo hành
                        </ClickableArea>
                     )}
                  </section>
                  <section className={"mt-6"}>
                     <div className={"mb-2 flex justify-between"}>
                        <h2 className={"font-base text-base text-neutral-500"}>Thông tin đính kèm</h2>
                     </div>
                     <Form.Item<FieldType> name={"note"} rules={[{ required: true }]}>
                        <Input.TextArea
                           placeholder="Nhập thông tin đính kèm cho bên bảo hành thiết bị"
                           maxLength={300}
                           showCount
                           allowClear
                           rows={3}
                        />
                     </Form.Item>
                  </section>
               </Form>
            </>
         )}
         <OverlayControllerWithRef ref={control_taskAssignFixerModal}>
            <Task_AssignFixerV2Drawer
               onSubmit={(fixer, date, priority) => {
                  setSelectedUser(fixer)
                  setSelectedDate(date)
                  setSelectedPriority(priority)
               }}
            />
         </OverlayControllerWithRef>
      </Drawer>
   )
}

export default Request_ApproveToRenewDrawer
export type { Request_ApproveToRenewDrawerProps as Request_ApproveToWarrantyDrawerProps }
