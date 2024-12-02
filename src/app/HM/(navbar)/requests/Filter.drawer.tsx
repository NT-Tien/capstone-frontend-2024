"use client"

import { Button, DatePicker, Divider, Drawer, DrawerProps, Input, InputNumber, Radio, Select, Space } from "antd"
import Form from "antd/es/form"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils/cn.util"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { AreaDto } from "@/lib/domain/Area/Area.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { UserDto } from "@/lib/domain/User/User.dto"
import { DeleteOutlined } from "@ant-design/icons"

type FilterQuery = {
   status: FixRequestStatus
   areaId?: string
   requester_note?: string
   machineModelId?: string
   requesterId?: string
   createdAt_start?: string
   createdAt_end?: string
   no_issues_min?: number
   no_issues_max?: number
   no_tasks_min?: number
   no_tasks_max?: number
   hasReviewed?: boolean
   hasSeen?: boolean
}
type FilterDrawerProps = {
   query?: FilterQuery
   status?: FixRequestStatus
   onSubmit?: (query: FilterQuery, status: FixRequestStatus) => void
   onReset?: () => void
   machineModels?: MachineModelDto[]
   areas?: AreaDto[]
   requesters?: UserDto[]
}
type Props = Omit<DrawerProps, "children"> &
   FilterDrawerProps & {
      handleClose?: () => void
   }

function FilterDrawer(props: Props) {
   const [form] = Form.useForm<FilterQuery>()
   const [selectedStatus, setSelectedStatus] = useState<FixRequestStatus>(props.status ?? FixRequestStatus.PENDING)

   function handleSubmit(values: FilterQuery, status: FixRequestStatus) {
      form.resetFields()
      props.handleClose?.()
      props.onSubmit?.(values, status)
   }

   function handleReset() {
      form.resetFields()
      props.handleClose?.()
      props.onReset?.()
   }

   useEffect(() => {
      setSelectedStatus(props.status ?? FixRequestStatus.PENDING)
      form.setFieldsValue({
         ...props.query,
      })
   }, [form, props.query, props.status])

   return (
      <Drawer
         title="Lọc thông tin"
         placement={"bottom"}
         height={"90%"}
         footer={
            <div className={"flex items-center gap-3"}>
               <Button type={"default"} size={"large"} onClick={handleReset}>
                  Xóa
               </Button>
               <Button block type={"primary"} size={"large"} onClick={form.submit}>
                  Lọc
               </Button>
            </div>
         }
         classNames={{
            footer: "p-layout",
         }}
         {...props}
      >
         <Form<FilterQuery> form={form} onFinish={(values) => handleSubmit(values, selectedStatus)}>
            <article className={"flex flex-col gap-2"}>
               <label className={"mb-1 text-base"}>Trạng thái</label>
               <section className={"grid grid-cols-2 gap-2"}>
                  <Button
                     size="middle"
                     type={selectedStatus === FixRequestStatus.PENDING ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus(FixRequestStatus.PENDING)}
                  >
                     Đang xử lý
                  </Button>
                  <Button
                     size="middle"
                     type={selectedStatus === FixRequestStatus.APPROVED ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus(FixRequestStatus.APPROVED)}
                  >
                     Đã xác nhận lỗi
                  </Button>
               </section>
               <section className={"grid grid-cols-3 gap-2"}>
                  <Button
                     size="middle"
                     type={selectedStatus === FixRequestStatus.IN_PROGRESS ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus(FixRequestStatus.IN_PROGRESS)}
                  >
                     Đang thực hiện
                  </Button>
                  <Button
                     size="middle"
                     type={selectedStatus === FixRequestStatus.CLOSED ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus(FixRequestStatus.CLOSED)}
                  >
                     Đã hoàn thành
                  </Button>
                  <Button
                     size="middle"
                     type={selectedStatus === FixRequestStatus.REJECTED ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus(FixRequestStatus.REJECTED)}
                  >
                     Từ chối sửa
                  </Button>
               </section>
            </article>
            <Divider />
            {selectedStatus === FixRequestStatus.PENDING && (
               <Form.Item<FilterQuery> name={"hasSeen"} label={"Trạng thái xem"}>
                  <Radio.Group className="flex w-full" buttonStyle={"solid"}>
                     <Radio.Button className={"w-full"} value={false}>
                        Đã xem
                     </Radio.Button>
                     <Radio.Button className={"w-full"} value={true}>
                        Chưa xem
                     </Radio.Button>
                  </Radio.Group>
               </Form.Item>
            )}
            {selectedStatus === FixRequestStatus.CLOSED && (
               <Form.Item<FilterQuery> name={"hasReviewed"} label={"Trạng thái đánh giá (trưởng phòng)"}>
                  <Radio.Group className="flex w-full" buttonStyle={"solid"}>
                     <Radio.Button className={"w-full"} value={false}>
                        Chưa đánh giá
                     </Radio.Button>
                     <Radio.Button className={"w-full"} value={true}>
                        Đã đánh giá
                     </Radio.Button>
                  </Radio.Group>
               </Form.Item>
            )}
            {new Set([FixRequestStatus.APPROVED, FixRequestStatus.IN_PROGRESS, FixRequestStatus.CLOSED]).has(
               selectedStatus,
            ) && (
               <Form.Item label={"Số lỗi"}>
                  <Space.Compact>
                     <Form.Item<FilterQuery> name={"no_issues_min"} noStyle>
                        <InputNumber min={0} className="w-full" placeholder={"(min)"} />
                     </Form.Item>
                     <Form.Item<FilterQuery> name={"no_issues_max"} noStyle>
                        <InputNumber min={0} className="w-full" placeholder={"(max)"} />
                     </Form.Item>
                  </Space.Compact>
               </Form.Item>
            )}
            {new Set([FixRequestStatus.APPROVED, FixRequestStatus.IN_PROGRESS, FixRequestStatus.CLOSED]).has(
               selectedStatus,
            ) && (
               <Form.Item label={"Số tác vụ"}>
                  <Space.Compact>
                     <Form.Item<FilterQuery> name={"no_tasks_min"} noStyle>
                        <InputNumber min={0} className="w-full" placeholder={"(min)"} />
                     </Form.Item>
                     <Form.Item<FilterQuery> name={"no_tasks_max"} noStyle>
                        <InputNumber min={0} className="w-full" placeholder={"(max)"} />
                     </Form.Item>
                  </Space.Compact>
               </Form.Item>
            )}
            <Form.Item<FilterQuery> name={"areaId"} label={"Khu vực"}>
               <Select
                  placeholder={"Tìm kiếm theo khu vực"}
                  options={props.areas?.map((i) => ({
                     label: i.name,
                     value: i.id,
                  }))}
                  showSearch
                  allowClear
                  filterOption={(input, option) => option?.label.toLowerCase().includes(input.toLowerCase()) ?? false}
               />
            </Form.Item>
            <Form.Item<FilterQuery> name={"requester_note"} label={"Ghi chú"}>
               <Input placeholder={"Tìm kiếm theo ghi chú"} allowClear />
            </Form.Item>
            <Form.Item<FilterQuery> name={"requesterId"} label={"Người yêu cầu"}>
               <Select
                  placeholder={"Tìm kiếm theo người yêu cầu"}
                  options={props.requesters?.map((i) => ({
                     label: i.username,
                     value: i.id,
                  }))}
                  showSearch
                  allowClear
                  filterOption={(input, option) => option?.label.toLowerCase().includes(input.toLowerCase()) ?? false}
               />
            </Form.Item>
            <Form.Item<FilterQuery> name={"machineModelId"} label={"Mẫu máy"}>
               <Select
                  placeholder="Tìm kiếm theo mẫu máy"
                  options={props.machineModels?.map((i) => ({
                     label: i.name,
                     value: i.id,
                  }))}
                  showSearch
                  allowClear
                  filterOption={(input, option) => option?.label.toLowerCase().includes(input.toLowerCase()) ?? false}
               />
            </Form.Item>
            <Form.Item label={"Ngày tạo"}>
               <Space.Compact>
                  <Form.Item<FilterQuery> name={"createdAt_start"}>
                     <DatePicker placeholder={"Ngày bắt đầu"} />
                  </Form.Item>
                  <Form.Item<FilterQuery> name={"createdAt_end"}>
                     <DatePicker placeholder={"Ngày kết thúc"} />
                  </Form.Item>
               </Space.Compact>
            </Form.Item>
         </Form>
      </Drawer>
   )
}

export default FilterDrawer
export type { FilterQuery, FilterDrawerProps }
