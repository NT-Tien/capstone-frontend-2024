import { ReactNode, useState } from "react"
import { DrawerForm, ProForm, ProFormText } from "@ant-design/pro-components"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { App } from "antd"
import Admin_Users_Create from "@/features/admin/api/user/create.api"
import qk from "@/old/querykeys"

type FieldType = {
   username: string
   phone: string
   password: string
   role: string
}

export default function CreateUserDrawer({ children }: { children: (handleOpen: () => void) => ReactNode }) {
   const [open, setOpen] = useState(false)
   const [form] = ProForm.useForm()
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const mutate_createUser = useMutation({
      mutationFn: Admin_Users_Create,
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
            <ProFormText name="phone" label="Số điện thoại" rules={[{ required: true }]} />
            <ProFormText.Password name="password" label="Mật khẩu" rules={[{ required: true }]} />
            <ProFormText name="role" label="Chức vụ" rules={[{ required: true }]} />
         </DrawerForm>
      </>
   )
}
