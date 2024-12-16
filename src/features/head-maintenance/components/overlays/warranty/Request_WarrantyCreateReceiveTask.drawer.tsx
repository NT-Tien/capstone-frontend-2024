"use client"

import CustomDatePicker from "@/components/CustomDatePicker"
import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import { ExportStatusMapper } from "@/lib/domain/ExportWarehouse/ExportStatus.enum"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import TaskNameGenerator from "@/lib/domain/Task/TaskNameGenerator.util"
import { TaskStatus, TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { CloseOutlined, PlusOutlined } from "@ant-design/icons"
import { Calendar, ChartDonut, Gear, Ticket, User } from "@phosphor-icons/react"
import { Avatar, Button, Card, Descriptions, Divider, Drawer, DrawerProps, Form, Space, Steps, Tag } from "antd"
import dayjs, { type Dayjs } from "dayjs"

type FieldType = {
   date: Dayjs
}

type Request_WarrantyCreateReceiveTaskProps = {
   request?: RequestDto
   onSuccess?: () => void
   expectedReceiveDate?: Dayjs
}
type Props = Omit<DrawerProps, "children"> & Request_WarrantyCreateReceiveTaskProps

function Request_WarrantyCreateReceiveTask(props: Props) {
   const [form] = Form.useForm<FieldType>()

   const taskName = props.request ? TaskNameGenerator.generateWarranty(props.request) : "-"
   const hasReplacementDevice = true

   const mutate_createReceiveTask = head_maintenance_mutations.request.createReturnWarranty()

   function handleFinish(values: FieldType) {
      if (!props.request) return
      mutate_createReceiveTask.mutate(
         {
            id: props.request?.id,
            payload: {
               taskName,
               fixerDate: values.date.toISOString(),
               priority: false,
            },
         },
         {
            onSuccess: () => {
               props.onSuccess?.()
            },
         },
      )
   }

   function Footer() {
      return (
         <Form.Item shouldUpdate noStyle>
            {(values) => {
               const disabled = values.getFieldsValue().date === undefined
               return (
                  <Button
                     block
                     type="primary"
                     icon={<PlusOutlined />}
                     disabled={disabled}
                     onClick={() => {
                        form.submit()
                     }}
                  >
                     Tạo tác vụ
                  </Button>
               )
            }}
         </Form.Item>
      )
   }

   return (
      <Form form={form} onFinish={handleFinish}>
         <Drawer
            title={
               <div className="mb-layout flex items-start justify-between gap-2">
                  <div>
                     <h1 className="text-lg font-semibold text-black">Tác vụ Lấy thiết bị</h1>
                     <p className="text-sm font-medium text-neutral-500">{taskName}</p>
                     {/* {api_task.isSuccess && (
                     <div className="mt-2">{api_task.data.priority && <Tag color="red">Ưu tiên</Tag>}</div>
                  )} */}
                  </div>
                  <Button size="middle" type="text" icon={<CloseOutlined />} onClick={props.onClose}></Button>
               </div>
            }
            classNames={{ header: "border-none pb-0", body: "pt-0", footer: "p-layout" }}
            closeIcon={null}
            placement={"bottom"}
            height={"70%"}
            footer={<Footer />}
            {...props}
         >
            <section>
               <Steps
                  size="small"
                  items={[
                     {
                        typeError: {
                           name: "Lấy thiết bị đã bảo hành",
                           description: "Lấy thiết bị đã bảo hành từ trung tâm bảo hành",
                        },
                     },
                     ...(hasReplacementDevice
                        ? [
                             {
                                typeError: {
                                   name: "Tháo gỡ thiết bị thay thế",
                                   description: "Tháo gỡ thiết bị thay thế để trả về kho",
                                },
                             },
                          ]
                        : []),
                     {
                        typeError: {
                           name: "Lắp đặt thiết bị",
                           description: "Lắp đặt thiết bị mới được bảo hành",
                        },
                     },
                  ].map((i) => ({
                     title: <div className="text-base font-medium">{i?.typeError.name}</div>,
                     description: <div className="text-sm">{i?.typeError.description}</div>,
                  }))}
               />
            </section>
            <Divider className="mb-4 mt-2" />
            <section className="flex text-sm mb-2">
               <h3 className="font-semibold mr-auto">Ngày bảo hành xong (dự tính):</h3>
               <div>{props.expectedReceiveDate?.format("DD/MM/YYYY") ?? "-"}</div>
            </section>
            <section>
               <header className="mb-2">
                  <h3 className="text-sm font-semibold">Ngày thực hiện tác vụ</h3>
               </header>
               <Form.Item<FieldType> name="date">
                  <CustomDatePicker
                     bounds={{
                        min: dayjs().startOf("day"),
                        max: dayjs().add(1, "year").endOf("year"),
                     }}
                  />
               </Form.Item>
            </section>
         </Drawer>
      </Form>
   )
}

export default Request_WarrantyCreateReceiveTask
export type { Request_WarrantyCreateReceiveTaskProps }
