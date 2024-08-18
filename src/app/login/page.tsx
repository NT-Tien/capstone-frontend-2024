"use client"

import { App, Button, Card, Form, Input, Spin, Typography } from "antd"
import { useMutation } from "@tanstack/react-query"
import LoginCredentials from "@/app/login/_api/login-credentials.api"
import { NotFoundError } from "@/common/error/not-found.error"
import { useRouter, useSearchParams } from "next/navigation"
import { decodeJwt } from "@/common/util/decodeJwt.util"
import { Role } from "@/common/enum/role.enum"
import Cookies from "js-cookie"
import { Suspense, useEffect, useState } from "react"
import useEnvEditor from "@/common/hooks/useEnvEditor"

type FieldType = {
   username: string
   password: string
}

// component uses useSearchParams so it must be wrapped in Suspense
export default function Page_Login() {
   return (
      <Suspense fallback={<Spin fullscreen={true} />}>
         <Login />
      </Suspense>
   )
}

function Login() {
   const { message } = App.useApp()
   const router = useRouter()
   const params = useSearchParams()
   const [form] = Form.useForm<FieldType>()
   const { handleDelayedOpenEnvEditor } = useEnvEditor()

   const [loading, setLoading] = useState<boolean>(false)

   const mutate_loginCredentials = useMutation({
      mutationFn: LoginCredentials,
      onMutate: async () => {
         setLoading(true)
      },
      onError: async (error) => {
         setLoading(false)

         form.resetFields()
         if (error instanceof NotFoundError) {
            message.error("Login failed. Account not found.")
            return
         }

         message.error("Login failed. Please try again.")
      },
   })

   function handleFinish(values: FieldType) {
      mutate_loginCredentials.mutate(values, {
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
      const error = params.get("error")
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
   }, [message, params])

   return (
      <>
         {loading && <Spin fullscreen tip="Logging in..." />}
         <div className="grid h-full place-content-center gap-3">
            <Card onClick={handleDelayedOpenEnvEditor}>
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
                  disabled={mutate_loginCredentials.isPending}
               >
                  <Form.Item<FieldType>
                     name="username"
                     label="Tên đăng nhập"
                     tooltip="What's your username?"
                     rules={[{ required: true }]}
                  >
                     <Input size="large" placeholder="e.g., account" autoFocus />
                  </Form.Item>
                  <Form.Item<FieldType>
                     name="password"
                     label="Mật khẩu"
                     tooltip="What's your password?"
                     rules={[{ required: true }]}
                  >
                     <Input.Password placeholder="e.g., ********" size="large" />
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
