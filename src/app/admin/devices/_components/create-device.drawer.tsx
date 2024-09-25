import { ReactNode, useState } from "react"
import { DrawerForm, ProForm, ProFormDigit, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { App } from "antd"
import qk from "@/old/querykeys"
import Admin_Devices_Create, { Request } from "@/app/admin/_api/devices/create.api"
import Admin_Areas_All from "@/app/admin/_api/areas/all.api"
import Admin_MachineModel_All from "@/app/admin/_api/machine-model/all.api"

type FieldType = Request & {
   area: string
}

export default function CreateDeviceDrawer({ children }: { children: (handleOpen: () => void) => ReactNode }) {
   const [open, setOpen] = useState(false)
   const [form] = ProForm.useForm()
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const mutate_createDevice = useMutation({
      mutationFn: Admin_Devices_Create,
      onMutate: async () => {
         message.open({
            content: "Creating device...",
            key: "createDevice",
            type: "loading",
            duration: 0,
         })
      },
      onError: async () => {
         message.error("Create device failed")
      },
      onSuccess: async () => {
         message.success("Create device successful")
         await queryClient.invalidateQueries({
            queryKey: qk.devices.all(),
         })
      },
      onSettled: async () => {
         message.destroy("createDevice")
      },
   })

   function handleOpen() {
      setOpen(true)
   }

   function handleClose() {
      setOpen(false)
      form.resetFields()
   }

   async function handleSubmit(props: FieldType) {
      mutate_createDevice.mutate(props, {
         onSuccess: () => {
            handleClose()
         },
      })
   }

   return (
      <>
         {children(handleOpen)}
         <DrawerForm
            open={open}
            title="Create Device"
            form={form}
            onFinish={handleSubmit}
            onReset={() => form.resetFields()}
            drawerProps={{
               onClose: handleClose,
            }}
         >
            <ProFormTextArea name="description" label="Description" rules={[{ required: true }]} />
            <ProFormDigit
               name="operationStatus"
               label="Operation Status"
               rules={[{ required: true }, { transform: (value) => Number(value), type: "number" }]}
            />
            <ProFormSelect
               name="machineModel"
               label="Machine Model"
               showSearch
               placeholder="Select a machine model"
               rules={[{ required: true }]}
               request={async () => {
                  const data = await queryClient.ensureQueryData({
                     queryKey: qk.machineModels.all(),
                     queryFn: () => Admin_MachineModel_All(),
                  })

                  return data.map((model) => ({
                     label: model.name,
                     value: model.id,
                  }))
               }}
            />
            <ProFormSelect
               name="area"
               label="Area"
               shouldUpdate
               showSearch
               placeholder="Select an area"
               rules={[{ required: true }]}
               request={async () => {
                  const data = await queryClient.ensureQueryData({
                     queryKey: qk.areas.all(),
                     queryFn: () => Admin_Areas_All(),
                  })

                  return data.map((position) => ({
                     label: `${position.name} (${position.width}x${position.height})`,
                     value: position.id,
                  }))
               }}
            />
            <ProFormDigit
               name="positionX"
               label="Position X"
               rules={[{ required: true }, { transform: (value) => Number(value), type: "number" }]}
            />
            <ProFormDigit
               name="positionY"
               label="Position Y"
               rules={[{ required: true }, { transform: (value) => Number(value), type: "number" }]}
            />
         </DrawerForm>
      </>
   )
}
