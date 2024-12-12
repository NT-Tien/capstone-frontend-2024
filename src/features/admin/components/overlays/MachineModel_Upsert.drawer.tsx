"use client"

import { DatePicker, Divider, Drawer, DrawerProps, Select, Space } from "antd"
import { useEffect, useMemo, useState } from "react"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import Form from "antd/es/form"
import admin_mutations from "@/features/admin/mutations"
import Button from "antd/es/button"
import Input from "antd/es/input"
import admin_queries from "@/features/admin/queries"
import { PlusOutlined } from "@ant-design/icons"
import dayjs from "dayjs"

type FormFieldType = {
   name: string
   description: string
   manufacturer: string
   yearOfProduction: number
   dateOfReceipt: string
   warrantyTerm: string
}
type MachineModel_UpsertDrawerProps = {
   machineModel?: MachineModelDto
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> & MachineModel_UpsertDrawerProps

function MachineModel_UpsertDrawer(props: Props) {
   const [form] = Form.useForm<FormFieldType>()

   const [input_manufacturer, setInput_manufacturer] = useState<string>("")
   const [customManufacturers, setCustomManufacturers] = useState<string[]>([])
   const api_machineModel = admin_queries.machine_model.all({ withDevices: false })

   const mutate_createMachineModel = admin_mutations.machineModel.create()
   const mutate_updateMachineModel = admin_mutations.machineModel.update()

   const manufacturers = useMemo(() => {
      if (!api_machineModel.isSuccess) return []
      const set = new Set(api_machineModel.data?.map((item) => item.manufacturer))
      return Array.from(set)
   }, [api_machineModel.data, api_machineModel.isSuccess])

   const isUpdating = useMemo(() => {
      return !!props.machineModel
   }, [props.machineModel])

   function handleSubmit(formProps: FormFieldType) {
      if (isUpdating) {
         mutate_updateMachineModel.mutate(
            {
               id: props.machineModel!.id,
               payload: {
                  ...formProps,
               },
            },
            {
               onSuccess: () => {
                  props.onSuccess?.()
               },
            },
         )
      } else {
         mutate_createMachineModel.mutate(
            {
               ...formProps,
            },
            {
               onSuccess: () => {
                  props.onSuccess?.()
                  form.resetFields()
               },
            },
         )
      }
   }

   useEffect(() => {
      if (!props.open) {
         setCustomManufacturers([])
         setInput_manufacturer("")
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props.open])

   return (
      <Drawer
         title={isUpdating ? "Cập nhật mẫu máy" : "Thêm mẫu máy mới"}
         placement="right"
         footer={
            <div className="flex items-center gap-3">
               <Button onClick={props.onClose}>Hủy</Button>
               <Button block type="primary" onClick={() => form.submit()}>
                  {isUpdating ? "Cập nhật" : "Thêm mới"}
               </Button>
            </div>
         }
         classNames={{
            footer: "p-layout",
         }}
         {...props}
      >
         <Form<FormFieldType>
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            initialValues={{
               name: props.machineModel?.name,
               description: props.machineModel?.description,
               manufacturer: props.machineModel?.manufacturer,
               yearOfProduction: props.machineModel?.yearOfProduction,
               dateOfReceipt: props.machineModel?.dateOfReceipt ? dayjs(props.machineModel.dateOfReceipt) : null,
               warrantyTerm: props.machineModel?.warrantyTerm ? dayjs(props.machineModel.warrantyTerm) : null,
            }}
         >
            <Form.Item<FormFieldType>
               name="name"
               label="Tên mẫu máy"
               rules={[{ required: true }, { type: "string", max: 50 }]}
            >
               <Input placeholder="Nhập tên mẫu máy" />
            </Form.Item>
            <Form.Item<FormFieldType>
               name="description"
               label="Mô tả"
               rules={[{ required: true }, { type: "string", max: 2000 }]}
            >
               <Input.TextArea placeholder="Nhập mô tả" autoSize={{ minRows: 3 }} maxLength={2000} showCount />
            </Form.Item>
            <Form.Item<FormFieldType>
               name="manufacturer"
               label="Nhà sản xuất"
               rules={[
                  { required: true },
                  {
                     type: "string",
                     max: 100,
                  },
               ]}
            >
               <Select
                  showSearch
                  placeholder="Chọn nhà sản xuất"
                  dropdownRender={(menu) => (
                     <>
                        {menu}
                        <Divider style={{ margin: "8px 0" }} />
                        <Space style={{ padding: "0 8px 4px" }}>
                           <Input
                              placeholder="Nhập nhà sản xuất mới"
                              onKeyDown={(e) => e.stopPropagation()}
                              value={input_manufacturer}
                              onChange={(e) => setInput_manufacturer(e.target.value)}
                           />
                           <Button
                              type="text"
                              icon={<PlusOutlined />}
                              onClick={() => {
                                 if (input_manufacturer) {
                                    setCustomManufacturers((prev) => [input_manufacturer, ...prev])
                                    setInput_manufacturer("")
                                 }
                              }}
                           >
                              Thêm
                           </Button>
                        </Space>
                     </>
                  )}
                  filterOption={(input, option) =>
                     (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                  }
                  options={
                     [...customManufacturers, ...manufacturers].map((item) => ({
                        label: item,
                        value: item,
                     })) as any
                  }
               />
            </Form.Item>
            <Form.Item<FormFieldType> name="dateOfReceipt" label="Ngày nhập kho" rules={[{ required: true }]}>
               <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày nhập kho" />
            </Form.Item>
            <Form.Item<FormFieldType>
               name="yearOfProduction"
               label="Năm sản xuất"
               rules={[
                  { required: true },
                  {
                     type: "number",
                     validator: (rule, value, callback) => {
                        if (!value) {
                           callback()
                        } else if (value > 9999) {
                           callback("Năm sản xuất không hợp lệ")
                        } else if (value < 1000) {
                           callback("Năm sản xuất không hợp lệ")
                        } else {
                           callback()
                        }
                     },
                     transform: (value) => Number(value),
                  },
               ]}
            >
               <Input type="number" placeholder="Nhập năm sản xuất" />
            </Form.Item>
            <Form.Item<FormFieldType> name="warrantyTerm" label="Hạn bảo hành" rules={[{ required: true }]}>
               <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày bảo hành" />
            </Form.Item>
         </Form>
      </Drawer>
   )
}

export default MachineModel_UpsertDrawer
export type { MachineModel_UpsertDrawerProps }
