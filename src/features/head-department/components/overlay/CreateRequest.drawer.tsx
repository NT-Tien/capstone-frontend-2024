"use client"

import { Button, Drawer, DrawerProps, Input, Select } from "antd"
import AlertCard from "@/components/AlertCard"
import Form from "antd/es/form"
import RequestErrors from "@/lib/domain/Request/RequestErrors"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import head_department_mutations from "@/features/head-department/mutations"
import { useRouter } from "next/navigation"
import hd_uris from "@/features/head-department/uri"

type FieldType = {
   name: string
   description: string
}

type CreateRequestDrawerProps = {
   device?: DeviceDto
}
type Props = Omit<DrawerProps, "children"> & CreateRequestDrawerProps

function CreateRequestDrawer(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const router = useRouter()
   const mutate_createRequest = head_department_mutations.request.createRequest({})
   const name = Form.useWatch("name", form)

   function handleSubmit(formData: FieldType, deviceId: string) {
      mutate_createRequest.mutate(
         {
            requester_note: formData.description ? `${formData.name}: ${formData.description}` : formData.name,
            device: deviceId,
         },
         {
            onSuccess: (result) => {
               router.push(hd_uris.stack.history_id(result.id))
            },
         },
      )
   }

   return (
      <Drawer
         title="Tạo yêu cầu"
         placement="bottom"
         height="max-content"
         classNames={{
            footer: "p-layout",
         }}
         footer={
            <Button block type="primary" size="large" onClick={form.submit}>
               Gửi
            </Button>
         }
         {...props}
      >
         <AlertCard text="Vui lòng chọn vấn đề của thiết bị" type="info" />
         <Form<FieldType>
            form={form}
            layout="vertical"
            className="mt-6"
            onFinish={(data) => props.device && handleSubmit(data, props.device.id)}
         >
            <Form.Item<FieldType> name="name" label="Tên vấn đề" rules={[{ required: true }]}>
               <Select options={RequestErrors} placeholder="Chọn vấn đề" />
            </Form.Item>
            <Form.Item<FieldType>
               name="description"
               label="Mô tả"
               rules={[
                  {
                     required: name === "create",
                  },
               ]}
            >
               <Input.TextArea placeholder="Thêm mô tả vấn đề" maxLength={300} showCount rows={3} />
            </Form.Item>
         </Form>
      </Drawer>
   )
}

export default CreateRequestDrawer
export type { CreateRequestDrawerProps }
