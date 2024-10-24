"use client"

import { Button, DatePicker, Divider, Drawer, DrawerProps, Input, Radio, Select, Space } from "antd"
import Form from "antd/es/form"
import { useEffect, useState } from "react"
import { FixRequestStatuses } from "@/lib/domain/Request/RequestStatus.mapper"
import { cn } from "@/lib/utils/cn.util"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { AreaDto } from "@/lib/domain/Area/Area.dto"

type FilterQuery = {
   areaId?: string
   requester_note?: string
   machineModelId?: string
   createdAt_start?: string
   createdAt_end?: string
}
type FilterDrawerProps = {
   query?: FilterQuery
   status?: FixRequestStatuses | "all"
   onSubmit?: (query: FilterQuery, status: FixRequestStatuses | "all") => void
   onReset?: () => void
   machineModels?: MachineModelDto[]
   areas?: AreaDto[]
}
type Props = Omit<DrawerProps, "children"> &
   FilterDrawerProps & {
      handleClose?: () => void
   }

function FilterDrawer(props: Props) {
   const [form] = Form.useForm<FilterQuery>()
   const [selectedStatus, setSelectedStatus] = useState<FixRequestStatuses | "all">(props.status ?? "pending")

   function handleSubmit(values: FilterQuery, status: FixRequestStatuses | "all") {
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
      setSelectedStatus(props.status ?? "pending")
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
                     type={selectedStatus === "pending" ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus("pending")}
                  >
                     Đang xử lý
                  </Button>
                  <Button
                     size="middle"
                     type={selectedStatus === "in_progress" ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus("in_progress")}
                  >
                     Đang thực hiện
                  </Button>
               </section>
               <section className={"grid grid-cols-3 gap-2"}>
                  <Button
                     size="middle"
                     type={selectedStatus === "head_confirm" ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus("head_confirm")}
                  >
                     Chờ đánh giá
                  </Button>
                  <Button
                     size="middle"
                     type={selectedStatus === "closed" ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus("closed")}
                  >
                     Đóng
                  </Button>
                  <Button
                     size="middle"
                     type={selectedStatus === "rejected" ? "primary" : "default"}
                     className={cn("text-sm")}
                     onClick={() => setSelectedStatus("rejected")}
                  >
                     Đã hủy
                  </Button>
               </section>
               <Button
                  size="middle"
                  type={selectedStatus === "all" ? "primary" : "default"}
                  className={cn("text-sm")}
                  onClick={() => setSelectedStatus("all")}
               >
                  Tất cả
               </Button>
            </article>
            <Divider />
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
