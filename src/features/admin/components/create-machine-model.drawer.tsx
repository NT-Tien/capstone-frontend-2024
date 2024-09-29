import { ReactNode, useState } from "react"
import { DrawerForm, ProForm, ProFormDatePicker, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { App } from "antd"
import qk from "@/old/querykeys"
import Admin_MachineModels_Create, { Request } from "@/features/admin/api/machine-model/create.api"
import dayjs from "dayjs"

type FieldType = Request

export default function CreateMachineModelDrawer({ children }: { children: (handleOpen: () => void) => ReactNode }) {
   const [open, setOpen] = useState(false)
   const [form] = ProForm.useForm()
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const mutate_createMachineModel = useMutation({
      mutationFn: Admin_MachineModels_Create,
      onMutate: async () => {
         message.open({
            content: "Creating Machine Model...",
            key: "createMachineModel",
            type: "loading",
            duration: 0,
         })
      },
      onError: async () => {
         message.error("Create Machine Model failed")
      },
      onSuccess: async () => {
         message.success("Create Machine Model successful")
         await queryClient.invalidateQueries({
            queryKey: qk.machineModels.all(),
         })
      },
      onSettled: async () => {
         message.destroy("createMachineModel")
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
      mutate_createMachineModel.mutate(
         {
            ...props,
            yearOfProduction: dayjs(props.yearOfProduction).year(),
         },
         {
            onSuccess: () => {
               handleClose()
            },
         },
      )
   }

   return (
      <>
         {children(handleOpen)}
         <DrawerForm
            open={open}
            title="Create Machine Model"
            form={form}
            onFinish={handleSubmit}
            onReset={() => form.resetFields()}
            drawerProps={{
               onClose: handleClose,
            }}
         >
            <ProFormText name="name" label="Name" rules={[{ required: true }]} />
            <ProFormTextArea name="description" label="Description" rules={[{ required: true }]} />
            <ProFormText name="manufacturer" label="Manufacturer" rules={[{ required: true }]} />
            <ProFormDatePicker
               name="yearOfProduction"
               label="Year of Production"
               rules={[{ required: true }]}
               className="w-full"
               fieldProps={{
                  picker: "year",
                  mode: "year",
                  className: "w-full",
                  format: {
                     format: "YYYY",
                  },
               }}
            />
            <ProFormDatePicker
               name="dateOfReceipt"
               label="Date of Receipt"
               rules={[{ required: true }]}
               fieldProps={{
                  className: "w-full",
               }}
            />
            <ProFormDatePicker
               name="warrantyTerm"
               label="Warrenty Term"
               rules={[{ required: true }]}
               fieldProps={{
                  className: "w-full",
               }}
            />
         </DrawerForm>
      </>
   )
}
