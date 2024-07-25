"use client"

import React, { ReactNode } from "react"
import useModalControls from "@/common/hooks/useModalControls"
import { Button, Card, Drawer, DrawerProps, Form, Input } from "antd"
import { InfoCircleFilled } from "@ant-design/icons"
import { isUUID } from "@/common/util/isUUID.util"
import { useTranslation } from "react-i18next"

type FieldType = {
   deviceId: string
}

export default function ScannerInputManualDrawer(props: {
   children: (handleOpen: () => void) => ReactNode
   onFinish: (deviceId: string, handleClose: () => void) => Promise<void>
   drawerProps?: DrawerProps
   disabled?: boolean
}) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         form.resetFields()
      },
   })
   const [form] = Form.useForm<FieldType>()
   const { t } = useTranslation()

   return (
      <>
         {props.children(handleOpen)}
         <Drawer
            title={t("InputManually")}
            placement="bottom"
            onClose={handleClose}
            open={open}
            height="max-content"
            classNames={{
               body: "flex flex-col",
            }}
            {...props.drawerProps}
         >
            <Form<FieldType>
               disabled={props.disabled}
               form={form}
               onFinish={async (e) => {
                  await props.onFinish(e.deviceId, handleClose)
               }}
               layout="horizontal"
            >
               <Card size="small" hoverable className="mb-4">
                  <div className="flex items-start gap-2">
                     <InfoCircleFilled className="mt-1" />
                     <div className="text-base">{t("inputDeviceId")}</div>
                  </div>
               </Card>
               <Form.Item<FieldType>
                  name="deviceId"
                  label={t("DeviceId")}
                  labelAlign="left"
                  labelCol={{
                     span: 24,
                     className: "pb-0",
                  }}
                  validateDebounce={1000}
                  validateFirst
                  rules={[
                     { required: true },
                     {
                        validator: (_, value) =>
                           isUUID(value) ? Promise.resolve() : Promise.reject("Invalid Device ID"),
                     },
                  ]}
                  normalize={(original) => {
                     let value = original.replace(/-/g, "")
                     if (value.length > 8) {
                        value = `${value.slice(0, 8)}-${value.slice(8)}`
                     }
                     if (value.length > 13) {
                        value = `${value.slice(0, 13)}-${value.slice(13)}`
                     }
                     if (value.length > 18) {
                        value = `${value.slice(0, 18)}-${value.slice(18)}`
                     }
                     if (value.length > 23) {
                        value = `${value.slice(0, 23)}-${value.slice(23)}`
                     }
                     if (value.length > 36) {
                        value = value.slice(0, 36)
                     }
                     return value
                  }}
                  className="flex-grow"
               >
                  <Input
                     placeholder="e.g., e31d662e-05db-4bc4-8bfd-773f56618725"
                     size="large"
                     autoComplete="off"
                     aria-autocomplete="none"
                     max={36}
                     allowClear
                  />
               </Form.Item>
               <Button
                  key="submit-btn"
                  type="primary"
                  htmlType="submit"
                  onClick={form.submit}
                  className="w-full"
                  size="large"
               >
                  {t("Submit")}
               </Button>
            </Form>
         </Drawer>
      </>
   )
}