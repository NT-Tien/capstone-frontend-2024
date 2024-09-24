import { createContext, ReactNode, useState } from "react"
import { App, Form, Modal } from "antd"
import { ProFormText } from "@ant-design/pro-components"
import { clientEnv } from "@/env"
import api from "@/config/axios.config"

type EnvEditorContextType = {
   handleOpen: () => void
}

type FieldType = {
   BACKEND_URL: string
}

export const EnvEditorContext = createContext<null | EnvEditorContextType>(null)

export default function EnvEditorProvider({ children }: { children: ReactNode }) {
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()

   const [open, setOpen] = useState(false)

   function handleOpen() {
      setOpen(true)
   }

   function handleClose() {
      setOpen(false)
   }

   async function handleFinishForm(values: FieldType) {
      clientEnv.BACKEND_URL = values.BACKEND_URL
      api.defaults.baseURL = values.BACKEND_URL
      message.success("ENV updated")
      handleClose()
   }

   return (
      <>
         <EnvEditorContext.Provider value={{ handleOpen }}>{children}</EnvEditorContext.Provider>
         <Modal open={open} onCancel={handleClose} title="Sửa ENV" onOk={form.submit} okText="Lưu" cancelText="Đóng">
            <Form<FieldType> form={form} onFinish={handleFinishForm}>
               <ProFormText label="BACKEND_URL" name="BACKEND_URL" initialValue={clientEnv.BACKEND_URL} />
            </Form>
         </Modal>
      </>
   )
}
