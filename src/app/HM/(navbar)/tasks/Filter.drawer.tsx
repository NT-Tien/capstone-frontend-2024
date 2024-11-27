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
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"

type FilterQuery = {
   status: TaskStatus
   areaId?: string
   fixerNote?: string
   machineModelId?: string
   fixerId?: string
   createdAt_start?: string
   createdAt_end?: string
   no_issues_min?: number
   no_issues_max?: number
   no_tasks_min?: number
   no_tasks_max?: number
   hasReviewed?: boolean
}
type FilterDrawerProps = {
   query?: FilterQuery
   status?: TaskStatus
   onSubmit?: (query: FilterQuery, status: TaskStatus) => void
   onReset?: () => void
   machineModels?: MachineModelDto[]
   areas?: AreaDto[]
   fixer?: UserDto[]
}
type Props = Omit<DrawerProps, "children"> &
   FilterDrawerProps & {
      handleClose?: () => void
   }

function FilterDrawer(props: Props) {
   const [form] = Form.useForm<FilterQuery>()
   const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(props.status ?? TaskStatus.AWAITING_FIXER)

   function handleSubmit(values: FilterQuery, status: TaskStatus) {
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
      setSelectedStatus(props.status ?? TaskStatus.AWAITING_FIXER)
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
                     type={selectedStatus === TaskStatus.AWAITING_FIXER ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus(TaskStatus.AWAITING_FIXER)}
                  >
                     Chưa phân công
                  </Button>
                  <Button
                     size="middle"
                     type={selectedStatus === TaskStatus.ASSIGNED ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus(TaskStatus.ASSIGNED)}
                  >
                     Chưa bắt đầu
                  </Button>
               </section>
               <section className={"grid grid-cols-3 gap-2"}>
                  <Button
                     size="middle"
                     type={selectedStatus === TaskStatus.IN_PROGRESS ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus(TaskStatus.IN_PROGRESS)}
                  >
                     Đang làm
                  </Button>
                  <Button
                     size="middle"
                     type={selectedStatus === TaskStatus.COMPLETED ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus(TaskStatus.COMPLETED)}
                  >
                     Đã đóng
                  </Button>
                  <Button
                     size="middle"
                     type={selectedStatus === TaskStatus.AWAITING_SPARE_SPART ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus(TaskStatus.AWAITING_SPARE_SPART)}
                  >
                     Chờ linh kiện
                  </Button>
                  <Button
                     size="middle"
                     type={selectedStatus === TaskStatus.CANCELLED ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus(TaskStatus.CANCELLED)}
                  >
                     Đã hủy
                  </Button>
               </section>
            </article>
            <Divider />
            {/* {selectedStatus === FixRequestStatus.PENDING && (
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
            )} */}
            {selectedStatus === TaskStatus.COMPLETED && (
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
            {new Set([TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]).has(
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
            {new Set([TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]).has(
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
            <Form.Item<FilterQuery> name={"fixerNote"} label={"Ghi chú"}>
               <Input placeholder={"Tìm kiếm theo ghi chú"} allowClear />
            </Form.Item>
            <Form.Item<FilterQuery> name={"fixerId"} label={"Người sửa"}>
               <Select
                  placeholder={"Tìm kiếm theo người sửa"}
                  options={props.fixer?.map((i) => ({
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
