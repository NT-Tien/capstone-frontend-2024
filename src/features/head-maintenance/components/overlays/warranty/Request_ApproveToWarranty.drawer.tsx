import { RefType } from "@/components/utils/OverlayControllerWithRef"
import { Task_AssignFixerModalProps } from "@/features/head-maintenance/components/overlays/Task_AssignFixerV2.drawer"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { CloseOutlined, MoreOutlined, TruckOutlined } from "@ant-design/icons"
import { Calendar, Factory, Gavel, Gear, Truck } from "@phosphor-icons/react"
import { App, Divider, Drawer, DrawerProps, Input } from "antd"
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
   isMultiple?: boolean
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
               isMultiple: props.isMultiple,
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
               <h1 className={"text-lg font-semibold"}>Bảo hành thiết bị</h1>
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
            </>
         )}
      </Drawer>
   )
}

export default Request_ApproveToWarrantyDrawer
export type { Request_ApproveToWarrantyDrawerProps }
