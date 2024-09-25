"use client"

import LoginCredentials from "@/features/common/api/login-credentials.api"
import { Role } from "@/lib/domain/User/role.enum"
import { NotFoundError } from "@/lib/error/not-found.error"
import { decodeJwt } from "@/lib/domain/User/decodeJwt.util"
import LockOutlined from "@ant-design/icons/LockOutlined"
import UserOutlined from "@ant-design/icons/UserOutlined"
import { useMutation } from "@tanstack/react-query"
import App from "antd/es/app"
import Button from "antd/es/button"
import Card from "antd/es/card"
import Form from "antd/es/form"
import Input from "antd/es/input"
import Spin from "antd/es/spin"
import Typography from "antd/es/typography"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import EnvEditorProvider from "@/providers/EnvEditor.provider"
import useLoginMutation from "@/features/common/mutations/Login.mutation"

type FieldType = {
   username: string
   password: string
}

function Page({ searchParams }: { searchParams: { error: string } }) {
   const { message } = App.useApp()
   const router = useRouter()
   const [form] = Form.useForm<FieldType>()
   const { handleDelayedOpenEnvEditor } = EnvEditorProvider.useContext()

   const [loading, setLoading] = useState<boolean>(false)

   const mutations = {
      loginCredentials: useLoginMutation(),
   }

   function handleFinish(values: FieldType) {
      mutations.loginCredentials.mutate(values, {
         onSuccess: async (token: string) => {
            Cookies.set("token", token)
            const payload = decodeJwt(token)
            switch (payload.role) {
               case Role.admin: {
                  router.push("/admin/dashboard")
                  break
               }
               case Role.staff: {
                  router.push("/staff/dashboard")
                  break
               }
               case Role.headstaff: {
                  router.push("/head-staff")
                  break
               }
               case Role.head: {
                  router.push("/head/dashboard")
                  break
               }
               case Role.manager: {
                  router.push("/manager/dashboard")
                  break
               }
               case Role.stockkeeper: {
                  router.push("/stockkeeper")
                  break
               }
               default: {
                  message.info("This account has not been assigned a role. Please contact the administrator.")
               }
            }
         },
         onError: (e) => {
            setLoading(false)
         },
      })
   }

   useEffect(() => {
      message.destroy("error")
      const error = searchParams.error
      if (error === "unauthenticated") {
         message
            .open({
               content: "You are not allowed to access this page. Please login again.",
               key: "error",
               type: "error",
            })
            .then()
      }

      return () => {
         message.destroy("error")
      }
   }, [message, searchParams.error])

   return (
      <>
         {loading && <Spin fullscreen tip="Logging in..." />}
         <div className="grid h-full place-content-center gap-3">
            <Card
               onClick={() => {
                  handleDelayedOpenEnvEditor()
               }}
            >
               <Typography.Title level={4} className="select-none">
                  Đăng nhập
               </Typography.Title>
               <Typography.Text className="select-none">Vui lòng nhập tên đăng nhập và mật khẩu.</Typography.Text>
            </Card>
            <Card className="min-w-96">
               <Form
                  name="Login_Form"
                  form={form}
                  layout="vertical"
                  onFinish={handleFinish}
                  disabled={mutations.loginCredentials.isPending}
               >
                  <Form.Item<FieldType> name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                     <Input
                        size="large"
                        placeholder="Tên đăng nhập"
                        autoFocus
                        prefix={<UserOutlined className="mr-1" />}
                     />
                  </Form.Item>
                  <Form.Item<FieldType> name="password" label="Mật khẩu" rules={[{ required: true }]}>
                     <Input.Password placeholder="********" size="large" prefix={<LockOutlined className="mr-1" />} />
                  </Form.Item>
                  <Form.Item>
                     <Button type="primary" htmlType="submit" size="large" className="w-full">
                        Đăng nhập
                     </Button>
                  </Form.Item>
               </Form>
            </Card>
         </div>
      </>
   )
}

export default Page
