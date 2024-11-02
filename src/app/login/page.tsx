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
import staff_uri from "@/features/staff/uri"
import { Image } from "antd"

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
                  router.push(staff_uri.navbar.dashboard)
                  break
               }
               case Role.headstaff: {
                  router.push("/HM/dashboard")
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
         <div className="bg-animated-gradient flex min-h-screen items-center justify-center p-4">
            <Card
               className="w-full max-w-sm rounded-lg bg-white p-8 shadow-2xl"
               style={{ paddingTop: "5rem", paddingBottom: "5rem" }}
            >
               <div className="mb-6 flex justify-center">
                  <Image
                     src="/images/capstone_logo.png"
                     alt="Capstone Logo"
                     width={250}
                     height={90}
                     className="object-contain"
                  />
               </div>
               <Typography.Title level={3} className="select-none text-center font-bold text-gray-800">
                  Đăng nhập
               </Typography.Title>
               <Typography.Text className="mb-6 block select-none text-center text-gray-500">
                  Vui lòng nhập tên đăng nhập và mật khẩu.
               </Typography.Text>
               <Form
                  name="Login_Form"
                  form={form}
                  layout="vertical"
                  onFinish={handleFinish}
                  disabled={mutations.loginCredentials.isPending}
               >
                  <Form.Item name="username" rules={[{ required: true, message: "Please input your username!" }]}>
                     <Input
                        size="large"
                        placeholder="Username"
                        autoFocus
                        prefix={<UserOutlined className="mr-2 text-gray-500" />}
                        className="rounded-md px-3 py-2"
                     />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
                     <Input.Password
                        placeholder="Password"
                        size="large"
                        prefix={<LockOutlined className="mr-2 text-gray-500" />}
                        className="rounded-md px-3 py-2"
                     />
                  </Form.Item>
                  <Form.Item>
                     <Button
                        htmlType="submit"
                        size="large"
                        className="gradient-button w-full rounded-md"
                        style={{
                           background: "linear-gradient(90deg, #61D8DE, #915CEA, #E839F6)",
                           color: "#ffffff",
                           border: "none",
                           transition: "background 0.3s ease",
                        }}
                     >
                        Login
                     </Button>
                  </Form.Item>
               </Form>
            </Card>
         </div>

         <style jsx>{`
            /* Animated Background Gradient */
            .bg-animated-gradient {
               background: linear-gradient(90deg, #61d8de, #915cea, #e839f6);
               background-size: 200% 200%;
               animation: gradientAnimation 10s ease infinite;
            }

            @keyframes gradientAnimation {
               0% {
                  background-position: 0% 50%;
               }
               50% {
                  background-position: 100% 50%;
               }
               100% {
                  background-position: 0% 50%;
               }
            }

            /* Gradient Button */
            .gradient-button {
               background: linear-gradient(90deg, #61d8de, #915cea, #e839f6);
               color: white;
               border: none;
               transition: background 0.3s ease;
            }

            .gradient-button:hover {
               background: linear-gradient(90deg, #e839f6, #915cea, #61d8de);
            }
         `}</style>
      </>
   )
}

export default Page
