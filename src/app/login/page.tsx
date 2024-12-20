"use client"

import { Role } from "@/lib/domain/User/role.enum"
import { decodeJwt } from "@/lib/domain/User/decodeJwt.util"
import LockOutlined from "@ant-design/icons/LockOutlined"
import UserOutlined from "@ant-design/icons/UserOutlined"
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
import { Checkbox, Image } from "antd"
import hm_uris from "@/features/head-maintenance/uri"
import hd_uris from "@/features/head-department/uri"

type FieldType = {
   username: string
   password: string
}

function Page({ searchParams }: { searchParams: { error?: string, path?: string } }) {
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
            const uri = searchParams.path && decodeURIComponent(searchParams.path.trim()).split("/")
            Cookies.set("token", token)
            const payload = decodeJwt(token)
            switch (payload.role) {
               case Role.admin: {
                  if(uri && uri[1] === 'admin') {
                     router.push(searchParams.path!)
                     return
                  }
                  router.push("/admin/dashboard")
                  break
               }
               case Role.staff: {
                  if(uri && uri[1] === 'S') {
                     router.push(searchParams.path!)
                     return
                  }
                  router.push(staff_uri.navbar.dashboard)
                  break
               }
               case Role.headstaff: {
                  if(uri && uri[1] === 'HM') {
                     router.push(searchParams.path!)
                     return
                  }
                  router.push(hm_uris.navbar.dashboard)
                  break
               }
               case Role.head: {
                  if(uri && uri[1] === 'head') {
                     router.push(searchParams.path!)
                     return
                  }
                  router.push(hd_uris.navbar.dashboard)
                  break
               }
               case Role.manager: {
                  router.push("/manager/dashboard")
                  break
               }
               case Role.stockkeeper: {
                  if(uri && uri[1] === 'stockkeeper') {
                     router.push(searchParams.path!)
                     return
                  }
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
         <div className="bg-half-half-gradient flex min-h-screen items-center p-4">
            <div className="hidden w-1/2 flex-col items-center justify-center lg:flex">
               <Image
                  className="object-contain"
                  src="/images/logo2.png"
                  height={320}
                  width={600}
                  alt="Capstone Login"
                  preview={false}
               />
               <div className="typing-animation">
                  <span>
                     Chào mừng bạn đã quay trở lại với <span style={{ color: "#f6c018" }}>MMMS</span>
                  </span>
               </div>
            </div>
            <div className="flex flex-1 justify-center">
               <Card
                  className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg md:max-w-lg lg:w-3/4"
                  style={{ paddingTop: "3rem", paddingBottom: "3rem" }}
               >
                  <div className="mb-4 flex justify-center">
                     <Image
                        src="/images/capstone_logo2.png"
                        alt="Capstone Logo"
                        width={450}
                        height={100}
                        className="object-contain"
                        preview={false}
                     />
                  </div>
                  <Typography.Text className="mb-6 block select-none text-center text-gray-500" onClick={() => handleDelayedOpenEnvEditor()}>
                     Vui lòng đăng nhập để tiếp tục.
                  </Typography.Text>
                  <Form
                     name="Login_Form"
                     form={form}
                     layout="vertical"
                     onFinish={handleFinish}
                     disabled={mutations.loginCredentials.isPending}
                  >
                     <Form.Item
                        name="username"
                        rules={[{ required: true, message: "Vui lòng nhập email hoặc tên đăng nhập!" }]}
                     >
                        <Input
                           size="large"
                           placeholder="Email hoặc tên đăng nhập"
                           autoFocus
                           prefix={<UserOutlined className="mr-2 text-gray-500" />}
                           className="rounded-md px-3 py-2"
                        />
                     </Form.Item>
                     <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
                        <Input.Password
                           placeholder="Mật khẩu"
                           size="large"
                           prefix={<LockOutlined className="mr-2 text-gray-500" />}
                           className="rounded-md px-3 py-2"
                        />
                     </Form.Item>
                     <div className="mb-4 flex flex-col items-center justify-between md:flex-row">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                           <Checkbox className="text-gray-500">Nhớ tôi?</Checkbox>
                        </Form.Item>
                        <a href="#" className="mt-2 text-sm text-blue-600 hover:underline md:mt-0">
                           Quên mật khẩu?
                        </a>
                     </div>
                     <Form.Item>
                        <Button htmlType="submit" size="large" className="w-full rounded-md bg-[#6a6df4] text-white">
                           Đăng nhập
                        </Button>
                     </Form.Item>
                  </Form>
                  {/* <div className="mt-4 text-center text-sm text-gray-500">
                     Mới trên nền tảng của chúng tôi?{" "}
                     <a href="#" className="text-blue-600 hover:underline">
                        Đăng ký tài khoản
                     </a>
                  </div>
                  <div className="mt-4 flex justify-center space-x-3">
                     <Button shape="circle" icon={<FacebookOutlined />} className="social-button" />
                     <Button shape="circle" icon={<GoogleOutlined />} className="social-button" />
                     <Button shape="circle" icon={<TwitterOutlined />} className="social-button" />
                  </div> */}
               </Card>
            </div>
         </div>

         <style jsx>{`
            /* Animated Background Gradient */
            .bg-half-half-gradient {
               background: linear-gradient(90deg, #f1f0ff 70%, #dbdcf3 30%);
            }

            /* Responsive Background Gradient */
            @media (max-width: 768px) {
               .bg-half-half-gradient {
                  background: linear-gradient(90deg, #f1f0ff 50%, #dbdcf3 50%);
               }
            }

            /* Typing Animation */
            .typing-animation {
               font-size: 1.5rem;
               font-weight: bold;
               white-space: nowrap;
               overflow: hidden;
               border-right: 0.15em solid #000;
               animation:
                  typing 16s steps(40, end) infinite,
                  blink-caret 0.75s step-end infinite;
            }

            @keyframes typing {
               0% {
                  width: 0;
               }
               50% {
                  width: 100%;
               }
               100% {
                  width: 0;
               }
            }

            @keyframes blink-caret {
               from,
               to {
                  border-color: transparent;
               }
               50% {
                  border-color: black;
               }
            }

            .gradient-button {
               background: linear-gradient(90deg, #6366f1, #3b82f6); /* Background gradient */
               color: white; /* Text color */
               border: none; /* No border initially */
               transition:
                  background 0.3s ease,
                  border 0.3s ease,
                  color 0.3s ease; /* Smooth transition for hover effects */
            }

            /* Gradient Outline on Hover */
            .gradient-button:hover {
               background: transparent; /* Make the background transparent on hover */
               color: #3b82f6; /* Change text color on hover */
               border: 2px solid transparent; /* Set a transparent border to enable the gradient effect */
               border-image: linear-gradient(90deg, #61d8de, #915cea, #e839f6); /* Apply gradient to border */
               border-image-slice: 1; /* Fill the border with gradient */
            }

            .gradient-button:focus {
               outline: none; /* Remove default focus outline */
            }

            /* Social Button */
            .social-button {
               border: 1px solid #e0e0e0;
               color: #757575;
               transition:
                  color 0.3s ease,
                  border-color 0.3s ease;
            }

            .social-button:hover {
               color: #3b82f6;
               border-color: #3b82f6;
            }
         `}</style>
      </>
   )
}

export default Page
