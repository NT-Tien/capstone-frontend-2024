import { RefType } from "@/components/utils/OverlayControllerWithRef"
import {
   Task_AssignFixerModalProps,
} from "@/features/head-maintenance/components/overlays/Task_AssignFixerV2.drawer"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import {
   CloseOutlined,
   MoreOutlined,
   TruckOutlined
} from "@ant-design/icons"
import { Laptop, Truck } from "@phosphor-icons/react"
import { App, Card, Descriptions, Divider, Drawer, DrawerProps, Input } from "antd"
import Button from "antd/es/button"
import Form from "antd/es/form"
import dayjs, { Dayjs } from "dayjs"
import { useEffect, useRef } from "react"

type FieldType = {
   note: string
   fixerDate: Dayjs
}

type Request_ApproveToWarrantyDrawerProps = {
   requestId?: string
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> & Request_ApproveToWarrantyDrawerProps

function Request_ApproveToWarrantyDrawer(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const { modal } = App.useApp()

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
      requestId: string,
   ) {
      mutate_approveToWarranty.mutate(
         {
            id: requestId,
            payload: {
               note: values.note,
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
                                 <div
                                    className="line-clamp-3 h-full w-full"
                                 >
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
                     handleSubmit(values, props.requestId)
                  }
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
                           placeholder="Ghi chú bảo hành"
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
      </Drawer>
   )
}

export default Request_ApproveToWarrantyDrawer
export type { Request_ApproveToWarrantyDrawerProps }
