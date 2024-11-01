import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"
import { Button, Divider, Drawer, DrawerProps, Input, Select } from "antd"
import Form from "antd/es/form"
import admin_mutations from "../../mutations"
import admin_queries from "../../queries"
import { useEffect, useMemo } from "react"

type FormFieldTypes = {
   name: string
   duration: number
   description: string
   machineModel: string
}

type TypeError_UpsertDrawerProps = {
   typeError?: TypeErrorDto
   machineModel?: MachineModelDto
   onSuccess?: () => void
}

type Props = Omit<DrawerProps, "children"> & TypeError_UpsertDrawerProps

function TypeError_UpsertDrawer(props: Props) {
   const [form] = Form.useForm<FormFieldTypes>()
   const mutate_createTypeError = admin_mutations.typeError.create()
   const mutate_updateTypeError = admin_mutations.typeError.update()
   const api_device = admin_queries.machine_model.all({ withDevices: false })

   const machineModels = useMemo(() => {
      if (!api_device.isSuccess) return []
      return api_device.data.map((item) => ({
         label: item.name,
         value: item.id,
      }))
   }, [api_device.data, api_device.isSuccess])

   const isUpdating = useMemo(() => {
      return !!props.typeError
   }, [props.typeError])

   useEffect(() => {
      if (!props.open) {
         form.setFieldsValue({
            name: props.typeError?.name,
            duration: props.typeError?.duration,
            description: props.typeError?.description,
            machineModel: props.machineModel?.id,
         })
      }
   }, [props.open])

   function handleSubmit(formProps: FormFieldTypes) {
      if (isUpdating) {
         mutate_updateTypeError.mutate(
            {
               id: props.typeError!.id,
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
         mutate_createTypeError.mutate(
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
         title={isUpdating ? "Cập nhật lỗi" : "Thêm lỗi mới"}
         placement="right"
         footer={
            <div className="flex items-center gap-3">
               <Button onClick={() => form.resetFields()}>Hủy</Button>
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
         <Form<FormFieldTypes>
            form={form}
            onFinish={handleSubmit}
            initialValues={{
               name: props.typeError?.name,
               duration: props.typeError?.duration,
               descrition: props.typeError?.description,
               machineModels: props.machineModel?.id,
            }}
         >
            <Form.Item<FormFieldTypes>
               name="name"
               label="Tên lỗi"
               rules={[{ required: true }, { type: "string", max: 200 }]}
            >
               <Input placeholder="Nhập tên"></Input>
            </Form.Item>
            <Form.Item<FormFieldTypes> name="duration" label="Thời lượng" rules={[{ required: true }]}>
               <Input placeholder="Nhập thời lượng"></Input>
            </Form.Item>
            <Form.Item<FormFieldTypes>
               name="description"
               label="Mô tả"
               rules={[{ required: true }, { type: "string" }]}
            >
               <Input placeholder="Nhập mô tả"></Input>
            </Form.Item>
            <Form.Item<FormFieldTypes> name="machineModel" label="Mẫu máy" rules={[{ required: true }]}>
               <Select
                  placeholder="Chọn mẫu máy"
                  dropdownRender={(menu) => (
                     <>
                        {menu}
                        <Divider style={{ margin: "8px 0" }} />
                     </>
                  )}
                  filterOption={(input, option) =>
                     (option?.label ?? "").toString().toLocaleLowerCase().includes(input.toLocaleLowerCase())
                  }
                  options={machineModels}
               />
            </Form.Item>
         </Form>
      </Drawer>
   )
}

export default TypeError_UpsertDrawer
export type { TypeError_UpsertDrawerProps }
