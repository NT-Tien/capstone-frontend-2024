"use client"

import { App, Button, Card, Form, Input, Spin, Typography } from "antd"
import { useMutation } from "@tanstack/react-query"
import LoginCredentials from "@/app/login/_api/login-credentials.api"
import { NotFoundError } from "@/common/error/not-found.error"
import { useRouter, useSearchParams } from "next/navigation"
import { decodeJwt } from "@/common/util/decodeJwt.util"
import { Role } from "@/common/enum/role.enum"
import Cookies from "js-cookie"
import { Suspense, useEffect } from "react"

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

   const mutate_loginCredentials = useMutation({
      mutationFn: LoginCredentials,
      onMutate: async () => {
         message.open({ content: "Logging in...", type: "loading", key: "loading" })
      },
      onSettled: async () => {
         message.destroy("loading")
      },
      onSuccess: async () => {
         message.open({ content: "Login successful", type: "success" })
      },
      onError: async (error) => {
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
                  router.push("/admin")
                  break
               }
               case Role.staff: {
                  router.push("/staff")
                  break
               }
               case Role.headstaff: {
                  router.push("/head-staff")
                  break
               }
               case Role.head: {
                  router.push("/head")
                  break
               }
               case Role.manager: {
                  router.push("/manager")
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
      <div className="grid h-full place-content-center gap-3">
         <Card>
            <Typography.Title level={4}>Login</Typography.Title>
            <Typography.Text>Enter your username and password to log in.</Typography.Text>
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
                  label="Username"
                  tooltip="What's your username?"
                  rules={[{ required: true }]}
               >
                  <Input size="large" placeholder="e.g., account" autoFocus />
               </Form.Item>
               <Form.Item<FieldType>
                  name="password"
                  label="Password"
                  tooltip="What's your password?"
                  rules={[{ required: true }]}
               >
                  <Input.Password placeholder="e.g., ********" size="large" />
               </Form.Item>
               <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" className="w-full">
                     Login
                  </Button>
               </Form.Item>
            </Form>
         </Card>
      </div>
   )
}
