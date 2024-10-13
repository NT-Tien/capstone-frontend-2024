"use client"

import { Drawer, DrawerProps } from "antd"
import Button from "antd/es/button"
import Form from "antd/es/form"
import Input from "antd/es/input"
import admin_mutations from "@/features/admin/mutations"
import { AreaDto } from "@/lib/domain/Area/Area.dto"
import { useEffect, useMemo } from "react"

type FormFieldType = {
   name: string
   instruction: string
   width: number
   height: number
}
type AreaUpsertDrawerProps = {
   onSuccess?: () => void
   area?: AreaDto
}
type Props = Omit<DrawerProps, "children"> & AreaUpsertDrawerProps

function Area_UpsertDrawer(props: Props) {
   const [form] = Form.useForm<FormFieldType>()
   const mutate_createArea = admin_mutations.area.create()
   const mutate_updateArea = admin_mutations.area.update()

   const isUpdating = useMemo(() => {
      return !!props.area
   }, [props.area])

   function handleSubmit(formProps: FormFieldType) {
      if (isUpdating) {
         mutate_updateArea.mutate(
            {
               id: props.area!.id,
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
         mutate_createArea.mutate(
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

   return (
      <Drawer
         title={isUpdating ? "Cập nhật khu vực" : "Tạo khu vực"}
         placement="right"
         classNames={{
            footer: "p-layout",
         }}
         footer={
            <div className="flex items-center gap-3">
               <Button type="default" onClick={() => form.resetFields()}>
                  Xóa
               </Button>
               <Button block type="primary" className={"flex-grow"} onClick={() => form.submit()}>
                  {isUpdating ? "Cập nhật" : "Tạo khu vực"}
               </Button>
            </div>
         }
         {...props}
      >
         <Form<FormFieldType>
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            initialValues={{
               name: props.area?.name,
               instruction: props.area?.instruction,
               width: props.area?.width,
               height: props.area?.height,
            }}
         >
            <Form.Item<FormFieldType> name="name" label="Tên khu vực" rules={[{ required: true }]}>
               <Input placeholder="Nhập tên khu vực" />
            </Form.Item>
            <Form.Item<FormFieldType> name="instruction" label="Mô tả" rules={[{ required: true }]}>
               <Input.TextArea placeholder="Nhập mô tả" />
            </Form.Item>
            <Form.Item<FormFieldType>
               name="width"
               label="Chiều rộng"
               rules={[{ required: true }]}
               tooltip={{ title: "Vui lòng nhập chiều rộng khu vực (thiết bị)" }}
            >
               <Input type="number" placeholder="Nhập chiều rộng" inputMode="numeric" />
            </Form.Item>
            <Form.Item<FormFieldType>
               name="height"
               label="Chiều cao"
               rules={[{ required: true }]}
               tooltip={{ title: "Vui lòng nhập chiều cao khu vực (thiết bị)" }}
            >
               <Input type="number" placeholder="Nhập chiều cao" inputMode="numeric" />
            </Form.Item>
         </Form>
      </Drawer>
   )
}

export default Area_UpsertDrawer
export type { AreaUpsertDrawerProps }
