import { ReactNode, useState } from "react"
import { DrawerForm, ProForm, ProFormDigit, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { App } from "antd"
import qk from "@/old/querykeys"
import Areas_Create from "@/features/admin/api/area/create.api"

type FieldType = {
   name: string
   instruction: string
   width: number
   height: number
}

export default function CreateAreaDrawer({ children }: { children: (handleOpen: () => void) => ReactNode }) {
   const [open, setOpen] = useState(false)
   const [form] = ProForm.useForm()
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const mutate_createArea = useMutation({
      mutationFn: Areas_Create,
      onMutate: async () => {
         message.open({
            content: "Creating area...",
            key: "createArea",
            type: "loading",
            duration: 0,
         })
      },
      onError: async () => {
         message.error("Create area failed")
      },
      onSuccess: async () => {
         message.success("Create area successful")
         await queryClient.invalidateQueries({
            queryKey: qk.areas.all(),
         })
      },
      onSettled: async () => {
         message.destroy("createArea")
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
      mutate_createArea.mutate(props, {
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
            title="Create Area"
            form={form}
            onFinish={handleSubmit}
            onReset={() => form.resetFields()}
            drawerProps={{
               onClose: handleClose,
            }}
         >
            <ProFormText name="name" label="Name" rules={[{ required: true }]} />
            <ProFormTextArea name="instruction" label="Instructions" rules={[{ required: true }]} />
            <ProFormDigit
               name="width"
               label="Width"
               rules={[{ required: true }, { transform: (value) => Number(value), min: 0 }]}
            />
            <ProFormDigit
               name="height"
               label="Height"
               rules={[{ required: true }, { transform: (value) => Number(value), min: 0 }]}
            />
         </DrawerForm>
      </>
   )
}
