import { App, Card, Descriptions, Drawer, DrawerProps, Input, Segmented } from "antd"
import Button from "antd/es/button"
import { CloseOutlined, MoreOutlined, TruckOutlined } from "@ant-design/icons"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import dayjs from "dayjs"
import Form from "antd/es/form"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"

type FieldType = {
   note: string
}

type Request_ApproveToWarrantyDrawerProps = {
   requestId?: string
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> & Request_ApproveToWarrantyDrawerProps

function Request_ApproveToWarrantyDrawer(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const { modal } = App.useApp()

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
            },
         },
         {
            onSuccess: props.onSuccess,
         },
      )
   }

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
                     <h2 className={"text-lg font-medium"}>Thông tin bảo hành</h2>
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
                                 className={"mt-2 h-20 w-full border-[1px] border-green-700 text-neutral-500"}
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
                                 {api_request.data.device.machineModel.description}
                              </Card>
                           ),
                           className: "*:flex-col",
                        },
                     ]}
                  />
               </section>
               <section className={"mt-6"}>
                  <div className={"mb-2 flex justify-between"}>
                     <h2 className={"text-lg font-medium"}>Thông tin đính kèm</h2>
                  </div>
                  <Form<FieldType>
                     form={form}
                     layout={"vertical"}
                     onFinish={(values) => props.requestId && handleSubmit(values, props.requestId)}
                  >
                     <Form.Item<FieldType> name={"note"} rules={[{ required: true }]}>
                        <Input.TextArea
                           placeholder="Nhập thông tin đính kèm cho bên bảo hành thiết bị"
                           maxLength={300}
                           showCount
                           allowClear
                           rows={3}
                        />
                     </Form.Item>
                  </Form>
               </section>
            </>
         )}
      </Drawer>
   )
}

export default Request_ApproveToWarrantyDrawer
export type { Request_ApproveToWarrantyDrawerProps }
