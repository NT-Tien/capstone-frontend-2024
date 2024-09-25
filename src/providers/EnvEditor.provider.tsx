import { createContext, ReactNode, useContext, useRef, useState } from "react"
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

const clickTimes = 5

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

EnvEditorProvider.useContext = () => {
   const context = useContext(EnvEditorContext)
   const { message } = App.useApp()
   const clickCountRef = useRef<number>(0)
   const timeoutRef = useRef<NodeJS.Timeout | null>(null)

   if (!context) {
      throw new Error("useEnvEditor must be used within a EnvEditorProvider")
   }

   async function handleDelayedOpenEnvEditor() {
      if (!context) return

      clickCountRef.current += 1
      message.destroy("env-editor-click-count")
      message.open({
         content: `Click ${clickTimes - clickCountRef.current} more times to open ENV editor`,
         type: "info",
         key: "env-editor-click-count",
      })

      if (clickCountRef.current === 5) {
         context.handleOpen()
         clickCountRef.current = 0
         message.destroy("env-editor-click-count")
         message.open({
            content: "Opening ENV editor",
            type: "success",
            key: "env-editor-click-count",
         })
      }

      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
         clickCountRef.current = 0
      }, 1000) // 1s
   }

   return { context, handleDelayedOpenEnvEditor }
}
