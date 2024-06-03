"use client"
import React from "react"
import type { FormProps } from "antd"
import { Button, Form, Input } from "antd"
import { loginApi } from "@/app/login/_api/login.api"

type FieldType = {
   username: string
   password: string
}

const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
   loginApi(values)
}

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
   console.log("Failed:", errorInfo)
}

const style = {
   display: "flex",
   justifyContent: "center",
   alignItems: "center",
   height: "100vh",
}

const App: React.FC = () => (
   <div style={style}>
      <Form
         name="basic"
         labelCol={{ span: 8 }}
         wrapperCol={{ span: 16 }}
         style={{ maxWidth: 600 }}
         initialValues={{ remember: true }}
         onFinish={onFinish}
         onFinishFailed={onFinishFailed}
         autoComplete="off"
      >
         <Form.Item<FieldType>
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
         >
            <Input />
         </Form.Item>

         <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
         >
            <Input.Password />
         </Form.Item>

         <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
               Submit
            </Button>
         </Form.Item>
      </Form>
   </div>
)

export default App
