import { Drawer, DrawerProps, Input, Select, Divider } from "antd"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { useEffect, useMemo } from "react"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import Button from "antd/es/button"
import Form from "antd/es/form"
import admin_mutations from "../../mutations"
import admin_queries from "../../queries"

type FormFieldTypes = {
   operationStatus: number
   description: string
   positionX?: number
   positionY?: number
   machineModel: string
   area?: string
}
type Device_UpsertDrawerProps = {
   device?: DeviceDto
   machineModel?: MachineModelDto
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> & Device_UpsertDrawerProps

function Device_UpsertDrawer(props: Props) {
   const [form] = Form.useForm<FormFieldTypes>()
   const mutate_createDevice = admin_mutations.device.create()
   const mutate_updateDevice = admin_mutations.device.update()
   const api_device = admin_queries.machine_model.all({ withDevices: false })
   const api_deviceArea = admin_queries.area.all({ withDevices: false })

   const machineModels = useMemo(() => {
      if (!api_device.isSuccess) return []
      return api_device.data.map((item) => ({
         label: item.name,
         value: item.id 
      }))
   }, [api_device.data, api_device.isSuccess])

   const areas = useMemo(() => {
      if (!api_deviceArea.isSuccess) return []
      return api_deviceArea.data.map((item) => ({
         label: item.name,
         value: item.id 
      }))
   }, [api_deviceArea.data, api_deviceArea.isSuccess])

   const isUpdating = useMemo(() => {
      return !!props.device
   }, [props.device])

   useEffect(() => {
      if (!props.open) {
         form.setFieldsValue({
            operationStatus: props.device?.operationStatus,
            description: props.device?.description,
            positionX: props.device?.positionX,
            positionY: props.device?.positionY,
            machineModel: props.device?.machineModel.id,
            area: props.device?.area.id,
         })
      }
   }, [props.open])

   function handleSubmit(formProps: FormFieldTypes) {
      if (isUpdating) {
         mutate_updateDevice.mutate(
            {
               id: props.device!.id,
               payload: {
                  ...formProps,
                  area: formProps.area ?? "",
                  positionX: formProps.positionX ?? 0,
                  positionY: formProps.positionY ?? 0,
               },
            },
            {
               onSuccess: () => {
                  props.onSuccess?.()
               },
            },
         )
      } else {
         mutate_createDevice.mutate(
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
         title={isUpdating ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}
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
               operationStatus: props.device?.operationStatus,
               description: props.device?.description,
               positionX: props.device?.positionX,
               positionY: props.device?.positionY,
               machineModel: props.device?.machineModel.id,
               area: props.device?.area.id,
            }}
         >
            <Form.Item<FormFieldTypes>
               name="operationStatus"
               label="Trạng thái kỹ thuật???"
               rules={[{ required: true }, { type: "string" }]}
            >
               <Input placeholder="Nhập trạng thái" />
            </Form.Item>
            <Form.Item<FormFieldTypes>
               name="description"
               label="Mô tả"
               rules={[{ required: true }, { type: "string", max: 300 }]}
            >
               <Input placeholder="Nhập mô tả" />
            </Form.Item>
            <Form.Item<FormFieldTypes>
               name="positionX"
               label="Vị trí (X)"
               rules={[{ required: true }, { type: "string" }]}
            >
               <Input placeholder="Nhập vị trí" />
            </Form.Item>
            <Form.Item<FormFieldTypes>
               name="positionY"
               label="Vị trí (Y)"
               rules={[{ required: true }, { type: "string" }]}
            >
               <Input placeholder="Nhập vị trí" />
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
            <Form.Item<FormFieldTypes> name="area" label="Khu vực" rules={[{ required: true }]}>
               <Select
                  placeholder="Chọn khu vực"
                  dropdownRender={(menu) => (
                     <>
                        {menu}
                        <Divider style={{ margin: "8px 0" }} />
                     </>
                  )}
                  filterOption={(input, option) =>
                     (option?.label ?? "").toString().toLocaleLowerCase().includes(input.toLocaleLowerCase())
                  }
                  options={areas}
               />
            </Form.Item>
         </Form>
      </Drawer>
   )
}

export default Device_UpsertDrawer
export type { Device_UpsertDrawerProps }
