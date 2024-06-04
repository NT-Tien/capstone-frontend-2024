import { ReactNode, useState } from "react"
import {
   DrawerForm,
   ProForm,
   ProFormDatePicker,
   ProFormDigit,
   ProFormSelect,
   ProFormText,
} from "@ant-design/pro-components"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { App } from "antd"
import qk from "@/common/querykeys"
import SpareParts_Create, { Request } from "@/app/admin/_api/spare-parts/create.api"
import MachineModel_All from "@/app/admin/_api/machine-model/all.api"

type FieldType = Request

export default function CreateSparePartDrawer({ children }: { children: (handleOpen: () => void) => ReactNode }) {
   const [open, setOpen] = useState(false)
   const [form] = ProForm.useForm()
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const mutate_createPosition = useMutation({
      mutationFn: SpareParts_Create,
      onMutate: async () => {
         message.open({
            content: "Creating Spare Part...",
            key: "createSparePart",
            type: "loading",
            duration: 0,
         })
      },
      onError: async () => {
         message.error("Create Spare Part failed")
      },
      onSuccess: async () => {
         message.success("Create Spare Part successful")
         await queryClient.invalidateQueries({
            queryKey: qk.spareParts.all(),
         })
      },
      onSettled: async () => {
         message.destroy("createSparePart")
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
      mutate_createPosition.mutate(props, {
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
            title="Create Spare Part"
            form={form}
            onFinish={handleSubmit}
            onReset={() => form.resetFields()}
            drawerProps={{
               onClose: handleClose,
            }}
         >
            <ProFormText name="name" label="Name" rules={[{ required: true }]} />
            <ProFormDigit
               name="quantity"
               label="Quantity"
               rules={[{ required: true }, { transform: (value) => Number(value), min: 0 }]}
            />
            <ProFormDatePicker
               name="expirationDate"
               label="Expiration Date"
               rules={[{ required: true }]}
               fieldProps={{
                  className: "w-full",
               }}
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
                     queryFn: () => MachineModel_All(),
                  })

                  return data.map((model) => ({
                     label: model.name,
                     value: model.id,
                  }))
               }}
            />
         </DrawerForm>
      </>
   )
}
