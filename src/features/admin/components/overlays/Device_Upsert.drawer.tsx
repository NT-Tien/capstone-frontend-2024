import { Drawer, DrawerProps, Input, Select, Divider, message } from "antd"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { useEffect, useMemo, useState } from "react"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import Button from "antd/es/button"
import Form from "antd/es/form"
import admin_mutations from "../../mutations"
import admin_queries from "../../queries"
import DevicePositionModal from "../DevicePosition.modal"

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
   const [isModalVisible, setIsModalVisible] = useState(false)
   const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null)
   const [areaDimensions, setAreaDimensions] = useState<{ width: number; height: number } | null>(null)
   const mutate_createDevice = admin_mutations.device.create()
   const mutate_updateDevice = admin_mutations.device.update()
   const api_device = admin_queries.machine_model.all({ withDevices: false })
   const api_deviceArea = admin_queries.area.all({ withDevices: false })

   const machineModels = useMemo(() => {
      if (!api_device.isSuccess) return []
      return api_device.data.map((item) => ({
         label: item.name,
         value: item.id,
      }))
   }, [api_device.data, api_device.isSuccess])

   const areas = useMemo(() => {
      if (!api_deviceArea.isSuccess) return []
      return api_deviceArea.data.map((item) => ({
         label: item.name,
         value: item.id,
      }))
   }, [api_deviceArea.data, api_deviceArea.isSuccess])

   const isUpdating = useMemo(() => {
      return !!props.device
   }, [props.device])

   useEffect(() => {
      if (props.device) {
         form.setFieldsValue({
            operationStatus: props.device?.operationStatus,
            description: props.device?.description,
            positionX: props.device?.positionX,
            positionY: props.device?.positionY,
            machineModel: props.device?.machineModel.id,
            area: props.device?.area.id,
         })
         setSelectedPosition(props.device ? { x: props.device.positionX, y: props.device.positionY } : null)
         if (props.device?.area) {
            setAreaDimensions({ width: props.device.area.width, height: props.device.area.height })
         }
      }
   }, [props.device])

   const handleSubmit = (formProps: FormFieldTypes) => {
      const payload = {
         positionX: selectedPosition?.x ?? 0,
         positionY: selectedPosition?.y ?? 0,
         area: formProps.area ?? "",
         operationStatus: formProps.operationStatus,
         description: formProps.description,
         machineModel: formProps.machineModel,
      }

      if (isUpdating) {
         mutate_updateDevice.mutate(
            { id: props.device!.id, payload },
            {
               onSuccess: () => {
                  props.onSuccess?.()
                  form.resetFields()
               },
            },
         )
      } else {
         mutate_createDevice.mutate(payload, {
            onSuccess: () => {
               props.onSuccess?.()
               form.resetFields()
            },
         })
      }
   }

   const handleAreaChange = (areaId: string) => {
      const selectedArea = api_deviceArea.data?.find((area) => area.id === areaId)
      if (selectedArea) {
         setAreaDimensions({ width: selectedArea.width, height: selectedArea.height })
      } else {
         setAreaDimensions(null)
      }
   }

   const handleSelectPosition = (x: number, y: number) => {
      setSelectedPosition({ x, y })
      form.setFieldsValue({ positionX: x, positionY: y })
      setIsModalVisible(false)
   }
   const handleOpenModal = () => {
      const area = form.getFieldValue("area")
      if (!area) {
         message.warning("Vui lòng chọn khu vực trước khi chọn vị trí.")
         return
      }
      setIsModalVisible(true)
   }
   console.log(form.getFieldValue("area"))

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
            <Form.Item<FormFieldTypes>
               name="description"
               label="Mô tả"
               rules={[{ required: true }, { type: "string", max: 300 }]}
            >
               <Input placeholder="Nhập mô tả" />
            </Form.Item>
            <Form.Item<FormFieldTypes>
               name="operationStatus"
               label="Thông số kỹ thuật"
               rules={[{ required: true }, { type: "string" }]}
            >
               <Input placeholder="Nhập thông số" />
            </Form.Item>
            <Form.Item<FormFieldTypes> name="area" label="Khu vực">
               <Select
                  placeholder="Chọn khu vực"
                  onChange={handleAreaChange}
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
            <Form.Item label="Vị trí">
               <Button onClick={handleOpenModal}>
                  {selectedPosition ? `X: ${selectedPosition.x}, Y: ${selectedPosition.y}` : "Chọn vị trí"}
               </Button>
            </Form.Item>
         </Form>
         <DevicePositionModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSelectPosition={handleSelectPosition}
            areaId={form.getFieldValue("area")}
            width={areaDimensions?.width || 0}
            height={areaDimensions?.height || 0}
         />
      </Drawer>
   )
}

export default Device_UpsertDrawer
export type { Device_UpsertDrawerProps }