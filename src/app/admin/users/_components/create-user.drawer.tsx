import { ReactNode, useState } from "react"
import { DrawerForm, ProForm, ProFormText } from "@ant-design/pro-components"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { App } from "antd"
import Users_Create from "@/app/admin/_api/users/create.api"
import qk from "@/common/querykeys"

type FieldType = {
   username: string
   phone: string
   password: string
   confirmPassword: string
}

export default function CreateUserDrawer({ children }: { children: (handleOpen: () => void) => ReactNode }) {
   const [open, setOpen] = useState(false)
   const [form] = ProForm.useForm()
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const mutate_createUser = useMutation({
      mutationFn: Users_Create,
      onMutate: async () => {
         message.open({
            content: "Creating user...",
            key: "createUser",
            type: "loading",
            duration: 0,
         })
      },
      onError: async () => {
         message.error("Create user failed")
      },
      onSuccess: async () => {
         message.success("Create user successful")
         await queryClient.invalidateQueries({
            queryKey: qk.users.all(),
         })
      },
      onSettled: async () => {
         message.destroy("createUser")
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
      mutate_createUser.mutate(props, {
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
            title="Create User"
            form={form}
            onFinish={handleSubmit}
            onReset={() => form.resetFields()}
            drawerProps={{
               onClose: handleClose,
            }}
         >
            <ProFormText name="username" label="Username" rules={[{ required: true }]} />
            <ProFormText name="phone" label="Phone" rules={[{ required: true }]} />
            <ProFormText.Password name="password" label="Password" rules={[{ required: true }]} />
            <ProFormText.Password name="confirmPassword" label="Confirm Password" rules={[{ required: true }]} />
         </DrawerForm>
      </>
   )
}
