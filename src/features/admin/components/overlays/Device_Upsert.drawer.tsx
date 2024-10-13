import { Drawer, DrawerProps } from "antd"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { useMemo } from "react"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import Button from "antd/es/button"
import Form from "antd/es/form"

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
}
type Props = Omit<DrawerProps, "children"> & Device_UpsertDrawerProps

function Device_UpsertDrawer(props: Props) {
   const [form] = Form.useForm<FormFieldTypes>()

   const isUpdating = useMemo(() => !!props.device, [props.device])

   function handleSubmit(formProps: FormFieldTypes) {}

   return (
      <Drawer
         title={isUpdating ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}
         placement="right"
         footer={
            <div className="flex items-center gap-3">
               <Button>Hủy</Button>
               <Button block type={"primary"}>
                  {isUpdating ? "Cập nhật" : "Thêm mới"}
               </Button>
            </div>
         }
         {...props}
      >
         <Form<FormFieldTypes> form={form} onFinish={handleSubmit}></Form>
      </Drawer>
   )
}

export default Device_UpsertDrawer
